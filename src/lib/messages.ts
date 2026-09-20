import type { SupabaseClient } from "@supabase/supabase-js";

export interface Conversation {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  createdAt: string;
  lastMessageAt: string;
  // Populated fields
  product?: {
    id: string;
    name: string;
    usdPrice: number;
    coverImageUrl?: string | null;
  };
  otherParty?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
  lastMessage?: {
    body: string;
    createdAt: string;
    senderId: string;
  };
  unreadCount?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt?: string | null;
}

/**
 * 6-digit handover code detection.
 *
 * The 6-digit code is the cryptographic proof that delivery happened.
 * If typed into a chat, a seller could social-engineer it from a buyer
 * and claim funds for an undelivered parcel.
 *
 * Detects 6 consecutive digits including common evasion delimiters (spaces, dashes, dots).
 */
export function containsHandoverCode(text: string): boolean {
  // 6 digits with optional spaces, dashes, or dots between digits
  const regex = /(?:^|\D)(\d[\s\-._]?\d[\s\-._]?\d[\s\-._]?\d[\s\-._]?\d[\s\-._]?\d)(?:\D|$)/;
  return regex.test(text);
}

export const HANDOVER_CODE_ERROR =
  "Security violation: 6-digit delivery handover codes must never be shared in chat. The code is your proof of physical delivery.";

/**
 * Detects phone numbers, emails, and off-platform messaging links (Telegram, WhatsApp).
 * Contact details are allowed, but display a one-time safety reminder that out-of-band
 * agreements are not protected by Stellar Escrow.
 */
export function containsContactInfo(text: string): boolean {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const handleRegex = /(?:@|(?:wa\.me\/|t\.me\/|telegram\.me\/|whatsapp\.com\/))\w{3,}/i;
  return emailRegex.test(text) || phoneRegex.test(text) || handleRegex.test(text);
}

export const OFFLINE_CONTACT_WARNING =
  "Reminder: Transactions or agreements made outside MarketX are unprotected by Stellar Escrow and cannot be mediated in disputes.";

/**
 * Get or create a conversation for a listing between a buyer and a seller.
 * One thread per listing between two users.
 */
export async function getOrCreateConversation(
  supabase: SupabaseClient,
  productId: string,
  buyerId: string,
  sellerId: string
): Promise<{ id: string } | null> {
  // First, check if conversation already exists
  const { data: existing, error: selectErr } = await supabase
    .from("conversations")
    .select("id")
    .eq("product_id", productId)
    .eq("buyer_id", buyerId)
    .maybeSingle();

  if (selectErr) {
    console.error("Error fetching conversation:", selectErr);
  }

  if (existing?.id) {
    return { id: existing.id };
  }

  // Create new thread
  const { data: created, error: insertErr } = await supabase
    .from("conversations")
    .insert({
      product_id: productId,
      buyer_id: buyerId,
      seller_id: sellerId,
    })
    .select("id")
    .single();

  if (insertErr) {
    // Check if created concurrently
    const { data: retry } = await supabase
      .from("conversations")
      .select("id")
      .eq("product_id", productId)
      .eq("buyer_id", buyerId)
      .maybeSingle();
    if (retry?.id) return { id: retry.id };
    console.error("Error creating conversation:", insertErr);
    return null;
  }

  return created ? { id: created.id } : null;
}

/**
 * Fetch all conversations for the authenticated user, ordered most recent first.
 */
export async function getUserConversations(
  supabase: SupabaseClient,
  userId: string
): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select(`
      id,
      product_id,
      buyer_id,
      seller_id,
      created_at,
      last_message_at,
      products (
        id,
        name,
        usd_price,
        cover_image_url
      ),
      buyer:profiles!buyer_id (
        id,
        display_name,
        avatar_url
      ),
      seller:profiles!seller_id (
        id,
        display_name,
        avatar_url
      ),
      messages (
        id,
        sender_id,
        body,
        created_at,
        read_at
      )
    `)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("last_message_at", { ascending: false });

  if (error || !data) {
    console.error("Error fetching conversations:", error);
    return [];
  }

  return (data as any[]).map((row) => {
    const isBuyer = row.buyer_id === userId;
    const otherProfile = isBuyer ? row.seller : row.buyer;
    const messages = Array.isArray(row.messages) ? row.messages : [];
    
    // Sort messages by created_at descending to find the last message
    const sortedMessages = [...messages].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const lastMsg = sortedMessages[0];
    const unreadCount = messages.filter(
      (m: any) => m.sender_id !== userId && !m.read_at
    ).length;

    return {
      id: row.id,
      productId: row.product_id,
      buyerId: row.buyer_id,
      sellerId: row.seller_id,
      createdAt: row.created_at,
      lastMessageAt: row.last_message_at,
      product: row.products
        ? {
            id: row.products.id,
            name: row.products.name,
            usdPrice: Number(row.products.usd_price) || 0,
            coverImageUrl: row.products.cover_image_url,
          }
        : undefined,
      otherParty: otherProfile
        ? {
            id: otherProfile.id,
            name: otherProfile.display_name || "User",
            avatarUrl: otherProfile.avatar_url,
          }
        : { id: "unknown", name: "User" },
      lastMessage: lastMsg
        ? {
            body: lastMsg.body,
            createdAt: lastMsg.created_at,
            senderId: lastMsg.sender_id,
          }
        : undefined,
      unreadCount,
    };
  });
}

/**
 * Fetch messages for a specific conversation.
 */
export async function getConversationMessages(
  supabase: SupabaseClient,
  conversationId: string
): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("id, conversation_id, sender_id, body, created_at, read_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    console.error("Error fetching messages:", error);
    return [];
  }

  return data.map((m: any) => ({
    id: m.id,
    conversationId: m.conversation_id,
    senderId: m.sender_id,
    body: m.body,
    createdAt: m.created_at,
    readAt: m.read_at,
  }));
}

/**
 * Send a message within a conversation.
 * Validates against 6-digit handover codes before sending.
 */
export async function sendMessage(
  supabase: SupabaseClient,
  params: { conversationId: string; senderId: string; body: string }
): Promise<{ success: boolean; message?: Message; error?: string }> {
  const trimmed = params.body.trim();
  if (!trimmed) {
    return { success: false, error: "Message cannot be empty." };
  }

  if (containsHandoverCode(trimmed)) {
    return { success: false, error: HANDOVER_CODE_ERROR };
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: params.conversationId,
      sender_id: params.senderId,
      body: trimmed,
    })
    .select("id, conversation_id, sender_id, body, created_at, read_at")
    .single();

  if (error || !data) {
    return {
      success: false,
      error: error?.message || "Failed to send message.",
    };
  }

  // Update last_message_at on conversation
  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", params.conversationId);

  return {
    success: true,
    message: {
      id: data.id,
      conversationId: data.conversation_id,
      senderId: data.sender_id,
      body: data.body,
      createdAt: data.created_at,
      readAt: data.read_at,
    },
  };
}

/**
 * Mark messages in a conversation as read.
 */
export async function markMessagesAsRead(
  supabase: SupabaseClient,
  conversationId: string,
  userId: string
): Promise<void> {
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", userId)
    .is("read_at", null);
}

/**
 * Report a conversation or user.
 */
export async function reportConversation(
  supabase: SupabaseClient,
  params: { conversationId: string; reporterId: string; reason: string }
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from("conversation_reports").insert({
    conversation_id: params.conversationId,
    reporter_id: params.reporterId,
    reason: params.reason,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Error reporting conversation:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}
