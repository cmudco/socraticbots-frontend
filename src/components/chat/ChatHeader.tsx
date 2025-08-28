import React, { useState } from 'react';

import { AlertTriangle, BookOpen, Clock, Loader2, Trash2 } from 'lucide-react';

import { useConversationStore, useMessages } from '@/stores/core/conversationStore';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import BotSelector from './BotSelector';
import ExportButton from './ExportButton';

const ChatHeader: React.FC = () => {
  const { currentBotId, currentBot, setActiveBot, activeConversation, deleteCurrentConversation } =
    useConversationStore();
  const messages = useMessages();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Handle delete conversation
  const handleDeleteConversation = async () => {
    if (!activeConversation?.dareConversationId) return;

    setIsDeleting(true);
    try {
      await deleteCurrentConversation();
      setIsConfirmOpen(false);
      if (currentBot) {
        await setActiveBot(currentBot);
      }
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

            {/* Action buttons - only show if there are messages */}
            {messages.length > 0 && (
              <div className="flex items-center gap-2">
                <ExportButton />
                <button
                  onClick={() => setIsConfirmOpen(true)}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
                  title="Reset conversation and learning progress"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Reset confirmation dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="bg-destructive/10 flex h-10 w-10 items-center justify-center rounded-full">
                <AlertTriangle className="text-destructive h-5 w-5" />
              </div>
              <DialogTitle className="text-lg font-semibold">Reset Conversation</DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground pt-2">
              This will permanently delete all messages and learning progress for this conversation.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConversation} disabled={isDeleting}>
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </div>
              ) : (
                'Yes, Reset'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatHeader;
