import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify user is part of conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || !conversation.participants.includes(userId)) {
      throw new Error("Not authorized");
    }

    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: userId,
      content: args.content,
      messageType: "text",
    });

    // Update conversation's last message time
    await ctx.db.patch(args.conversationId, {
      lastMessageTime: Date.now(),
    });

    return messageId;
  },
});

export const sendAttachment = mutation({
  args: {
    conversationId: v.id("conversations"),
    attachmentId: v.id("_storage"),
    attachmentName: v.string(),
    attachmentType: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify user is part of conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || !conversation.participants.includes(userId)) {
      throw new Error("Not authorized");
    }

    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: userId,
      attachmentId: args.attachmentId,
      attachmentName: args.attachmentName,
      attachmentType: args.attachmentType,
      messageType: "attachment",
    });

    // Update conversation's last message time
    await ctx.db.patch(args.conversationId, {
      lastMessageTime: Date.now(),
    });

    return messageId;
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    return await ctx.storage.generateUploadUrl();
  },
});
