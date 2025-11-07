import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  conversations: defineTable({
    name: v.optional(v.string()), // For group chats
    type: v.union(v.literal("direct"), v.literal("group")),
    participants: v.array(v.id("users")),
    createdBy: v.id("users"),
    lastMessageTime: v.optional(v.number()),
  })
    .index("by_participant", ["participants"])
    .index("by_created_by", ["createdBy"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.optional(v.string()),
    attachmentId: v.optional(v.id("_storage")),
    attachmentName: v.optional(v.string()),
    attachmentType: v.optional(v.string()),
    messageType: v.union(v.literal("text"), v.literal("attachment")),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_sender", ["senderId"]),

  userProfiles: defineTable({
    userId: v.id("users"),
    displayName: v.string(),
    avatar: v.optional(v.id("_storage")),
    status: v.union(v.literal("online"), v.literal("offline"), v.literal("away")),
    lastSeen: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
