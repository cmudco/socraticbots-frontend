import React, { useState } from 'react';

import { AlertTriangle, BookOpen, Clock, Loader2, Trash2 } from 'lucide-react';

import { useConversationStore, useMessages } from '@/stores/core/conversationStore';

import { Badge } from '@/components/ui/badge';

import BotSelector from './BotSelector';
import ExportButton from './ExportButton';

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
      <header className="border-border/60 from-background via-muted/90 to-background top-0 z-10 w-full border-b bg-gradient-to-r shadow-sm backdrop-blur-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="from-primary to-primary/80 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-md">
                  <BookOpen className="text-primary-foreground h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground text-sm font-medium">Bot:</span>
                    {currentBotId ? (
                      <Badge
                        variant="secondary"
                        className="border-primary/20 bg-primary/10 text-primary"
                      >
                        <div className="bg-primary mr-1.5 h-1.5 w-1.5 rounded-full"></div>
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-border bg-muted text-muted-foreground"
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

            {/* Action buttons - only show if there are messages and no confirmation dialog */}
            {messages.length > 0 && !showDeleteConfirm && (
              <div className="flex items-center gap-2">
                <ExportButton />
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
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
                  className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md px-3 py-2 text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConversation}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:bg-destructive/50 flex items-center gap-1 rounded-md px-3 py-2 text-sm transition-colors"
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
        <div className="border-destructive/20 bg-destructive/5 border-b px-6 py-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-destructive h-5 w-5" />
            <div>
              <p className="text-destructive text-sm font-medium">Delete this conversation?</p>
              <p className="text-destructive/80 text-xs">
                This will permanently delete all messages and learning progress.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatHeader;
