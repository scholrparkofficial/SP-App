import React, { useState, useEffect } from "react";
import { X, UserPlus, Check } from "lucide-react";
import { searchUsers, createGroup } from "../firebase";

export default function CreateGroupModal({ isOpen, onClose, currentUser, onCreateSuccess }) {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setGroupName("");
      setSelectedUsers([]);
      setSearchTerm("");
      setSearchResults([]);
      setLoading(false);
    }
  }, [isOpen]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await searchUsers(searchTerm);
      // Filter out current user and already selected users
      const filtered = results.filter(
        u => u.uid !== currentUser.uid && !selectedUsers.find(su => su.uid === u.uid)
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const addUser = (user) => {
    if (!selectedUsers.find(u => u.uid === user.uid)) {
      setSelectedUsers([...selectedUsers, user]);
      // Keep search results visible to add more users
      // Just remove this user from search results
      setSearchResults(searchResults.filter(u => u.uid !== user.uid));
    }
  };

  const isUserSelected = (userId) => {
    return selectedUsers.find(u => u.uid === userId);
  };

  const removeUser = (userId) => {
    setSelectedUsers(selectedUsers.filter(u => u.uid !== userId));
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      alert("Please enter a group name");
      return;
    }

    if (selectedUsers.length === 0) {
      alert("Please add at least one member");
      return;
    }

    setLoading(true);
    try {
      const participantIds = [currentUser.uid, ...selectedUsers.map(u => u.uid)];
      const groupId = await createGroup(groupName, currentUser.uid, participantIds);
      
      onCreateSuccess(groupId);
      onClose();
    } catch (error) {
      console.error("Error creating group:", error);
      alert("Failed to create group. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold dark:text-white">Create Group</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-300">Group Name</label>
            <input
              type="text"
              placeholder="Enter group name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>

          {/* Selected Members */}
          {selectedUsers.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                Members ({selectedUsers.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <div
                    key={user.uid}
                    className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full"
                  >
                    <span className="text-sm text-blue-800 dark:text-blue-200">
                      {user.displayName || user.email}
                    </span>
                    <button
                      onClick={() => removeUser(user.uid)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search for Members */}
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-300">Add Members</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                className="flex-1 p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Search
              </button>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="max-h-48 overflow-y-auto border rounded dark:border-gray-600">
              {searchResults.map((user) => (
                <div
                  key={user.uid}
                  className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => addUser(user)}
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={user.photoURL || "/avatar.png"}
                      alt={user.displayName}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <div className="text-sm font-medium dark:text-white">{user.displayName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                    </div>
                  </div>
                  {isUserSelected(user.uid) ? (
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <Check size={16} className="text-white" />
                    </div>
                  ) : (
                    <UserPlus size={20} className="text-blue-500" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600 text-gray-700 dark:text-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={loading || !groupName.trim() || selectedUsers.length === 0}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
}

