import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getConversations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const allConversations = await ctx.db.query("conversations").collect();
    const conversations = allConversations.filter(conv => 
      conv.participants.includes(userId)
    );

    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conv) => {
        const participants = await Promise.all(
          conv.participants.map(async (participantId) => {
            const user = await ctx.db.get(participantId);
            const profile = await ctx.db
              .query("userProfiles")
              .withIndex("by_user", (q) => q.eq("userId", participantId))
              .unique();
            return {
              ...user,
              profile: profile || {
                displayName: user?.email?.split("@")[0] || "User",
                status: "offline" as const,
                lastSeen: Date.now(),
              }
            };
          })
        );

        const lastMessage = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) => q.eq("conversationId", conv._id))
          .order("desc")
          .first();

        return {
          ...conv,
          participants,
          lastMessage,
        };
      })
    );

    return conversationsWithDetails.sort((a, b) => 
      (b.lastMessageTime || 0) - (a.lastMessageTime || 0)
    );
  },
});

export const createDirectConversation = mutation({
  args: {
    participantId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if conversation already exists
    const allConversations = await ctx.db.query("conversations").collect();
    const existingConv = allConversations.find(conv => 
      conv.type === "direct" &&
      conv.participants.includes(userId) &&
      conv.participants.includes(args.participantId) &&
      conv.participants.length === 2
    );

    if (existingConv) {
      return existingConv._id;
    }

    // Create new conversation
    const conversationId = await ctx.db.insert("conversations", {
      type: "direct",
      participants: [userId, args.participantId],
      createdBy: userId,
    });

    return conversationId;
  },
});

export const createGroupConversation = mutation({
  args: {
    name: v.string(),
    participantIds: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const participants = [userId, ...args.participantIds];
    
    const conversationId = await ctx.db.insert("conversations", {
      name: args.name,
      type: "group",
      participants,
      createdBy: userId,
    });

    return conversationId;
  },
});

export const getConversationMessages = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Verify user is part of conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || !conversation.participants.includes(userId)) {
      return [];
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .collect();

    const messagesWithSender = await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.senderId);
        const senderProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", message.senderId))
          .unique();

        let attachmentUrl = null;
        if (message.attachmentId) {
          attachmentUrl = await ctx.storage.getUrl(message.attachmentId);
        }

        return {
          ...message,
          sender: {
            ...sender,
            profile: senderProfile || {
              displayName: sender?.email?.split("@")[0] || "User",
              status: "offline" as const,
              lastSeen: Date.now(),
            }
          },
          attachmentUrl,
        };
      })
    );

    return messagesWithSender;
  },
});
