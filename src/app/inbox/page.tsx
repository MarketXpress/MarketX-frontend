"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MessageSquare, Shield, Package, Store, Clock, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import {
  Conversation,
  getUserConversations,
  getOrCreateConversation,
} from "@/lib/messages";
import ChatView from "@/components/messaging/ChatView";

function InboxContent() {
  const { user, isLoading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const targetProductId = searchParams.get("product");
  const targetSellerId = searchParams.get("seller");
  const targetConvId = searchParams.get("c");

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!authLoading && !user) {
      const redirectUrl = targetProductId
        ? `/inbox?product=${targetProductId}${targetSellerId ? `&seller=${targetSellerId}` : ""}`
        : "/inbox";
      router.push(`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`);
    }
  }, [user, authLoading, router, targetProductId, targetSellerId]);

  // Load user conversations
  useEffect(() => {
    if (!user) return;
    const currentUserId = user.id;
    let active = true;

    async function loadData() {
      setLoading(true);

      // If user came via Contact button on product page
      if (targetProductId && targetSellerId && targetSellerId !== currentUserId) {
        const conv = await getOrCreateConversation(
          supabase,
          targetProductId,
          currentUserId,
          targetSellerId
        );
        if (conv?.id && active) {
          setActiveConversationId(conv.id);
        }
      }

      const list = await getUserConversations(supabase, currentUserId);
      if (active) {
        setConversations(list);
        if (targetConvId) {
          setActiveConversationId(targetConvId);
        } else if (!activeConversationId && list.length > 0 && !targetProductId) {
          // Select first conversation on desktop
          setActiveConversationId(list[0].id);
        }
        setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [user, targetProductId, targetSellerId, targetConvId, supabase]);

  if (authLoading || (loading && !conversations.length)) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-ink-faint text-sm font-medium">
          <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const filteredConversations = conversations.filter((c) => {
    const term = search.toLowerCase();
    const otherName = c.otherParty?.name.toLowerCase() || "";
    const prodName = c.product?.name.toLowerCase() || "";
    const lastMsg = c.lastMessage?.body.toLowerCase() || "";
    return otherName.includes(term) || prodName.includes(term) || lastMsg.includes(term);
  });

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-black text-ink flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-accent" />
            Messages & Inquiries
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            One deal, one thread. In-app communication is backed by Stellar escrow evidence.
          </p>
        </div>
      </div>

      {/* ── Main Two-Column Layout ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[750px]">
        {/* ── Left: Conversation Thread List ── */}
        <div
          className={`md:col-span-5 lg:col-span-4 flex flex-col bg-surface border border-line rounded-2xl overflow-hidden ${
            activeConversationId ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Search bar */}
          <div className="p-3 border-b border-line bg-surface">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-9 pr-3 py-2 bg-surface-2 border border-line rounded-xl text-xs text-ink placeholder:text-ink-faint focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto divide-y divide-line">
            {filteredConversations.length === 0 ? (
              <div className="py-16 px-4 text-center text-xs text-ink-faint space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-ink-faint/50" />
                <p className="font-bold text-ink-muted">No conversations yet</p>
                <p>When you contact a seller or a buyer messages your listing, threads will appear here.</p>
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isActive = c.id === activeConversationId;
                const isSeller = c.sellerId === user.id;

                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveConversationId(c.id)}
                    className={`w-full p-4 text-left flex items-start gap-3 transition-colors ${
                      isActive
                        ? "bg-accent-soft/50 border-l-4 border-l-accent"
                        : "hover:bg-surface-2"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-on-accent text-sm font-bold shrink-0 mt-0.5">
                      {c.otherParty?.name.charAt(0).toUpperCase() || "U"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-bold text-ink truncate">
                          {c.otherParty?.name || "Participant"}
                        </span>
                        <span className="text-[10px] text-ink-faint shrink-0">
                          {c.lastMessageAt
                            ? new Date(c.lastMessageAt).toLocaleDateString([], {
                                month: "short",
                                day: "numeric",
                              })
                            : ""}
                        </span>
                      </div>

                      {c.product && (
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-accent truncate mb-1">
                          <Package className="w-3 h-3 shrink-0" />
                          <span className="truncate">{c.product.name}</span>
                          <span className="text-ink-faint shrink-0">
                            (${c.product.usdPrice})
                          </span>
                        </div>
                      )}

                      <p className="text-xs text-ink-muted truncate">
                        {c.lastMessage?.body || "No messages yet"}
                      </p>

                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-surface-2 text-ink-faint">
                          {isSeller ? "Selling" : "Buying"}
                        </span>
                        {Boolean(c.unreadCount && c.unreadCount > 0) && (
                          <span className="text-[10px] font-bold bg-accent text-on-accent px-1.5 py-0.2 rounded-full">
                            {c.unreadCount} new
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right: Active Chat View ── */}
        <div
          className={`md:col-span-7 lg:col-span-8 flex flex-col h-full ${
            activeConversationId ? "flex" : "hidden md:flex"
          }`}
        >
          {activeConversation ? (
            <ChatView
              key={activeConversation.id}
              conversation={activeConversation}
              currentUserId={user.id}
              onBack={() => setActiveConversationId(null)}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 bg-surface border border-line rounded-2xl text-center text-xs text-ink-faint">
              <Shield className="w-12 h-12 text-accent/40 mb-3" />
              <h3 className="text-sm font-bold text-ink mb-1">Select a Conversation</h3>
              <p className="max-w-xs text-ink-muted">
                Choose a listing thread from the left or click Contact on any item page to start talking.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InboxPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center text-ink-faint text-sm">
          Loading inbox...
        </div>
      }
    >
      <InboxContent />
    </Suspense>
  );
}
