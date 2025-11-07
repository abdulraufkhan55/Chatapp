import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SignOutButton } from "../SignOutButton";
import { UserList } from "./UserList";
import { ConversationList } from "./ConversationList";
import { ChatWindow } from "./ChatWindow";
import { CreateGroupModal } from "./CreateGroupModal";
import { Id } from "../../convex/_generated/dataModel";

export function ChatApp() {
  const [activeConversationId, setActiveConversationId] = useState<Id<"conversations"> | null>(null);
  const [showUserList, setShowUserList] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const currentUser = useQuery(api.users.getCurrentUser);
  const createUserProfile = useMutation(api.users.createUserProfile);

  useEffect(() => {
    if (currentUser && !currentUser.profile) {
      createUserProfile();
    }
  }, [currentUser, createUserProfile]);

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">ChatApp</h1>
            <SignOutButton />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowUserList(true)}
              className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              New Chat
            </button>
            <button
              onClick={() => setShowCreateGroup(true)}
              className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
            >
              New Group
            </button>
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          <ConversationList
            activeConversationId={activeConversationId}
            onSelectConversation={setActiveConversationId}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversationId ? (
          <ChatWindow conversationId={activeConversationId} />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to ChatApp</h3>
              <p className="text-gray-500">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showUserList && (
        <UserList
          onClose={() => setShowUserList(false)}
          onSelectUser={(userId) => {
            setShowUserList(false);
            // This will be handled by creating a conversation
          }}
        />
      )}

      {showCreateGroup && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          onGroupCreated={(conversationId) => {
            setShowCreateGroup(false);
            setActiveConversationId(conversationId);
          }}
        />
      )}
    </div>
  );
}
