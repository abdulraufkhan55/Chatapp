import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface ConversationListProps {
  activeConversationId: Id<"conversations"> | null;
  onSelectConversation: (id: Id<"conversations">) => void;
}

export function ConversationList({ activeConversationId, onSelectConversation }: ConversationListProps) {
  const conversations = useQuery(api.conversations.getConversations);
  const currentUser = useQuery(api.users.getCurrentUser);

  if (!conversations || !currentUser) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const getConversationName = (conversation: any) => {
    if (conversation.type === "group") {
      return conversation.name || "Group Chat";
    }
    
    // For direct messages, show the other participant's name
    const otherParticipant = conversation.participants.find(
      (p: any) => p._id !== currentUser._id
    );
    return otherParticipant?.profile?.displayName || otherParticipant?.email || "Unknown User";
  };

  const getLastMessagePreview = (message: any) => {
    if (!message) return "No messages yet";
    
    if (message.messageType === "attachment") {
      return `📎 ${message.attachmentName}`;
    }
    
    return message.content || "";
  };

  return (
    <div className="p-2">
      {conversations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No conversations yet</p>
          <p className="text-sm">Start a new chat or create a group</p>
        </div>
      ) : (
        <div className="space-y-1">
          {conversations.map((conversation) => (
            <button
              key={conversation._id}
              onClick={() => onSelectConversation(conversation._id)}
              className={`w-full p-3 text-left rounded-lg transition-colors ${
                activeConversationId === conversation._id
                  ? "bg-blue-50 border-blue-200 border"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {conversation.type === "group" ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                  ) : (
                    getConversationName(conversation).charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {getConversationName(conversation)}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {getLastMessagePreview(conversation.lastMessage)}
                  </div>
                </div>
                {conversation.lastMessageTime && (
                  <div className="text-xs text-gray-400">
                    {new Date(conversation.lastMessageTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
