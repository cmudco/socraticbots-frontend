import React, { useState } from 'react';

import { BookOpen, Clock, Trash2, AlertTriangle, Loader2 } from 'lucide-react';

import { useConversationStore } from '@/stores/core/conversationStore';
import { useMessages } from '@/stores/core/conversationStore';

import { Badge } from '@/components/ui/badge';

import BotSelector from './BotSelector';

const ChatHeader: React.FC = () => {
  const { currentBotId, activeConversation, deleteCurrentConversation } = useConversationStore();
  const messages = useMessages();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Handle delete conversation
  const handleDeleteConversation = async () => {
    if (!activeConversation?.dareConversationId) return;
    
    setIsDeleting(true);
    try {
      await deleteCurrentConversation();
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      // TODO: Show error toast/notification
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-10 w-full border-b border-slate-200/60 bg-gradient-to-r from-white via-slate-50/90 to-white shadow-sm backdrop-blur-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-slate-600">Bot:</span>
                    {currentBotId ? (
                      <Badge
                        variant="secondary"
                        className="border-violet-200 bg-violet-50 text-violet-700"
                      >
                        <div className="mr-1.5 h-1.5 w-1.5 rounded-full bg-violet-400"></div>
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-slate-300 bg-slate-50 text-slate-600"
                      >
                        <Clock className="mr-1 h-3 w-3" />
                        Select Bot
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1">
                    <BotSelector />
                  </div>
                </div>
              </div>
            </div>

            {/* Delete button - only show if there are messages and no confirmation dialog */}
            {messages.length > 0 && !showDeleteConfirm && (
              <div className="flex items-center">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete conversation and learning progress"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            )}

            {/* Delete confirmation controls */}
            {showDeleteConfirm && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-2 text-sm text-slate-600 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConversation}
                  disabled={isDeleting}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-md transition-colors"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            )}

          </div>
        </div>
      </header>

      {/* Delete confirmation banner */}
      {showDeleteConfirm && (
        <div className="bg-amber-50/95 border-b border-amber-200 px-6 py-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-800">Delete this conversation?</p>
              <p className="text-xs text-amber-700">This will permanently delete all messages and learning progress.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatHeader;
