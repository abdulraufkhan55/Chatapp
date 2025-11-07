import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface UserListProps {
  onClose: () => void;
  onSelectUser: (userId: Id<"users">) => void;
}

export function UserList({ onClose, onSelectUser }: UserListProps) {
  const users = useQuery(api.users.getAllUsers);
  const createDirectConversation = useMutation(api.conversations.createDirectConversation);

  const handleUserSelect = async (userId: Id<"users">) => {
    try {
      await createDirectConversation({ participantId: userId });
      onSelectUser(userId);
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Start New Chat</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-2">
          {users?.map((user) => (
            <button
              key={user._id}
              onClick={() => handleUserSelect(user._id)}
              className="w-full p-3 text-left hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.profile.displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">{user.profile.displayName}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
                <div className="ml-auto">
                  <div className={`w-3 h-3 rounded-full ${
                    user.profile.status === 'online' ? 'bg-green-500' :
                    user.profile.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`}></div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {users?.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No other users found
          </div>
        )}
      </div>
    </div>
  );
}
