"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Send,
  Shield,
  AlertTriangle,
  Flag,
  Ban,
  ArrowLeft,
  Check,
  CheckCheck,
  Package,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  Message,
  Conversation,
  containsHandoverCode,
  containsContactInfo,
  HANDOVER_CODE_ERROR,
  OFFLINE_CONTACT_WARNING,
  sendMessage,
  getConversationMessages,
  markMessagesAsRead,
  reportConversation,
} from "@/lib/messages";

interface ChatViewProps {
  conversation: Conversation;
  currentUserId: string;
  onBack?: () => void;
}

export default function ChatView({
  conversation,
  currentUserId,
  onBack,
}: ChatViewProps) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [hasContactWarning, setHasContactWarning] = useState(false);
  const [sending, setSending] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Load initial messages
  useEffect(() => {
    let active = true;

    async function load() {
      const msgs = await getConversationMessages(supabase, conversation.id);
      if (active) {
        setMessages(msgs);
        // Check if any existing message contains off-platform contact info to set warning
        const containsOffline = msgs.some((m) => containsContactInfo(m.body));
        if (containsOffline) setHasContactWarning(true);
        void markMessagesAsRead(supabase, conversation.id, currentUserId);
      }
    }

    load();

    // Subscribe to realtime postgres_changes on messages for this conversation
    const channel = supabase
      .channel(`chat:${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const newMsg = payload.new as any;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            const updated = [
              ...prev,
              {
                id: newMsg.id,
                conversationId: newMsg.conversation_id,
                senderId: newMsg.sender_id,
                body: newMsg.body,
                createdAt: newMsg.created_at,
                readAt: newMsg.read_at,
              },
            ];
            if (containsContactInfo(newMsg.body)) {
              setHasContactWarning(true);
            }
            return updated;
          });
          if (newMsg.sender_id !== currentUserId) {
            void markMessagesAsRead(supabase, conversation.id, currentUserId);
          }
        }
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [conversation.id, currentUserId, supabase]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    if (error) setError(null);

    // Live validation for 6-digit handover code
    if (containsHandoverCode(val)) {
      setError(HANDOVER_CODE_ERROR);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending || blocked) return;

    if (containsHandoverCode(trimmed)) {
      setError(HANDOVER_CODE_ERROR);
      return;
    }

    if (containsContactInfo(trimmed)) {
      setHasContactWarning(true);
    }

    setSending(true);
    setError(null);

    // Optimistic local add
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: Message = {
      id: tempId,
      conversationId: conversation.id,
      senderId: currentUserId,
      body: trimmed,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setInput("");

    const res = await sendMessage(supabase, {
      conversationId: conversation.id,
      senderId: currentUserId,
      body: trimmed,
    });

    setSending(false);
    if (!res.success) {
      setError(res.error || "Failed to send message.");
      // Rollback optimistic
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } else if (res.message) {
      // Replace optimistic with real message
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? res.message! : m))
      );
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) return;
    const res = await reportConversation(supabase, {
      conversationId: conversation.id,
      reporterId: currentUserId,
      reason: reportReason.trim(),
    });
    if (res.success) {
      setReportSuccess(true);
      setTimeout(() => {
        setReportModalOpen(false);
        setReportSuccess(false);
        setReportReason("");
      }, 1500);
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface border border-line rounded-2xl overflow-hidden shadow-sm">
      {/* ── Chat Header ── */}
      <div className="px-4 py-3 border-b border-line bg-surface flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 -ml-1 text-ink-faint hover:text-ink md:hidden rounded-lg hover:bg-surface-2 transition-colors"
              aria-label="Back to conversations"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-on-accent text-sm font-bold shrink-0">
            {conversation.otherParty?.name.charAt(0).toUpperCase() || "U"}
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-bold text-ink truncate">
              {conversation.otherParty?.name || "Participant"}
            </h2>
            {conversation.product && (
              <Link
                href={`/product/${conversation.productId}`}
                className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent-hover truncate"
              >
                <Package className="w-3 h-3" />
                <span className="truncate">{conversation.product.name}</span>
                <span className="font-semibold text-ink-muted shrink-0">
                  (${conversation.product.usdPrice})
                </span>
              </Link>
            )}
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setReportModalOpen(true)}
            className="p-2 text-ink-faint hover:text-warn hover:bg-surface-2 rounded-lg transition-colors"
            title="Report Conversation"
            aria-label="Report conversation"
          >
            <Flag className="w-4 h-4" />
          </button>
          <button
            onClick={() => setBlocked((b) => !b)}
            className={`p-2 rounded-lg transition-colors ${
              blocked
                ? "text-bad bg-bad-bg"
                : "text-ink-faint hover:text-bad hover:bg-surface-2"
            }`}
            title={blocked ? "Unblock user" : "Block user"}
            aria-label={blocked ? "Unblock user" : "Block user"}
          >
            <Ban className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Security & Policy Trust Bar ── */}
      <div className="bg-accent-soft px-4 py-2 border-b border-accent-line flex items-center gap-2 text-[11px] text-accent">
        <Shield className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">
          Protected by Stellar Escrow. In-app messages serve as verified dispute evidence.
        </span>
      </div>

      {/* ── One-time Off-platform Contact Warning ── */}
      {hasContactWarning && (
        <div className="bg-warn/10 border-b border-warn/20 px-4 py-2 flex items-start gap-2 text-xs text-ink-muted">
          <AlertTriangle className="w-4 h-4 text-warn shrink-0 mt-0.5" />
          <p className="leading-tight">{OFFLINE_CONTACT_WARNING}</p>
        </div>
      )}

      {/* ── Messages List ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface-2/30">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-ink-faint text-xs">
            <Shield className="w-8 h-8 mx-auto mb-2 text-accent/50" />
            <p className="font-semibold text-ink-muted">Start of conversation</p>
            <p className="mt-1">
              Discuss item specifications, shipping terms, or handover details.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.senderId === currentUserId;
            return (
              <div
                key={m.id}
                className={`flex flex-col ${
                  isMe ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                    isMe
                      ? "bg-accent text-on-accent rounded-br-none shadow-sm"
                      : "bg-surface border border-line text-ink rounded-bl-none shadow-xs"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-ink-faint px-1">
                  <span>
                    {new Date(m.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {isMe && (
                    <span>
                      {m.readAt ? (
                        <CheckCheck className="w-3 h-3 text-accent" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Composer Form ── */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-surface border-t border-line space-y-2"
      >
        {error && (
          <div className="flex items-center gap-2 text-xs text-bad bg-bad-bg border border-bad/20 p-2.5 rounded-xl">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {blocked ? (
          <div className="text-center py-3 text-xs text-bad font-medium bg-bad-bg rounded-xl border border-bad/20">
            You have blocked this participant. Unblock to send messages.
          </div>
        ) : (
          <div className="flex items-end gap-2">
            <textarea
              rows={1}
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend(e);
                }
              }}
              placeholder="Type a message (Enter to send, 6-digit handover codes are blocked)..."
              className="flex-1 max-h-32 min-h-[42px] py-2.5 px-3.5 bg-surface-2 border border-line rounded-xl text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending || !!error}
              className="h-[42px] px-4 bg-accent hover:bg-accent-hover disabled:opacity-50 text-on-accent rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs transition-colors shrink-0"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        )}
      </form>

      {/* ── Report Modal ── */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-line rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                <Flag className="w-4 h-4 text-warn" />
                Report Conversation
              </h3>
              <button
                onClick={() => setReportModalOpen(false)}
                className="text-xs text-ink-faint hover:text-ink"
              >
                Cancel
              </button>
            </div>

            {reportSuccess ? (
              <div className="p-4 bg-ok-bg text-ok text-xs font-semibold rounded-xl text-center">
                Report submitted. Our moderation team will review this transcript.
              </div>
            ) : (
              <>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Flag suspicious activity, off-platform payment solicitations, or
                  harassment. The unedited conversation transcript will be provided to
                  support.
                </p>
                <textarea
                  rows={3}
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Describe the issue..."
                  className="w-full p-3 bg-surface-2 border border-line rounded-xl text-xs text-ink placeholder:text-ink-faint focus:outline-none focus:border-accent"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setReportModalOpen(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-ink-muted hover:bg-surface-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReport}
                    disabled={!reportReason.trim()}
                    className="px-4 py-1.5 bg-warn text-white font-bold text-xs rounded-lg hover:bg-warn/90 disabled:opacity-50"
                  >
                    Submit Report
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
