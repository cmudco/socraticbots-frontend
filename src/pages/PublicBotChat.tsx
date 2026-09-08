import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import {
  AlertCircle,
  AlertTriangle,
  Bot as BotIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Moon,
  Sun,
  Trash2,
} from 'lucide-react';

import { useGetOrCreateConversation, usePublicBotInfo } from '@/hooks/queries/usePublicBot';
import { useBotTheme } from '@/hooks/useBotTheme';

import { usePublicBotStore } from '@/stores/core/publicBotStore';
import { usePublicWebSocketStore } from '@/stores/core/publicWebSocketStore';
import { useThemeStore } from '@/stores/ui/themeStore';

import { clearAnonymousSession, getOrCreateAnonymousSession } from '@/lib/anonymousSession';

import ChatErrorAlert from '@/components/chat/ChatErrorAlert';
import PublicChatInput from '@/components/chat/public/PublicChatInput';
import PublicMessageList from '@/components/chat/public/PublicMessageList';
import PublicTrackingSidebar from '@/components/chat/public/PublicTrackingSidebar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import type { PublicBotConversation } from '@/types/publicBot';

const PublicBotChat: React.FC = () => {
  const { botId } = useParams<{ botId: string }>();
  const [isProgressSidebarVisible, setProgressSidebarVisible] = useState(true);
  const [isResetConfirmOpen, setResetConfirmOpen] = useState(false);

  // Zustand stores
  const {
    setBotInfo,
    setActiveConversation,
    setAnonymousSessionId,
    setIsTyping,
    addMessage,
    anonymousSessionId,
    botInfo,
    activeConversation,
  } = usePublicBotStore();

  // Theme store for dark/light mode
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  // Apply bot theme dynamically
  const { fontClass, textSizeClass, roundedClass, spacingClass } = useBotTheme(
    botInfo?.theme,
    'bot-chat-root'
  );

  // Check if tracking is enabled for the current bot
  const isTrackingEnabled = botInfo?.modelPreference?.trackingModelDareId != null;

  // Public WebSocket store - Socket.IO (session-based auth)
  const {
    sendMessage: sendWebSocketMessage,
    error: socketError,
    setError: setSocketError,
  } = usePublicWebSocketStore();

  // React Query hooks
  const {
    data: fetchedBotInfo,
    isLoading: isLoadingBotInfo,
    error: botInfoError,
  } = usePublicBotInfo(botId);

  const {
    mutate: getOrCreateConversation,
    isPending: isCreatingConversation,
    error: conversationError,
  } = useGetOrCreateConversation();

  // Initialize anonymous session on mount
  useEffect(() => {
    const session = getOrCreateAnonymousSession();
    setAnonymousSessionId(session);
  }, [setAnonymousSessionId]);

  // Set bot info when fetched
  useEffect(() => {
    if (fetchedBotInfo) {
      setBotInfo(fetchedBotInfo);
    }
  }, [fetchedBotInfo, setBotInfo]);

  // Get or create conversation when we have bot info and session ID
  useEffect(() => {
    if (!botId || !anonymousSessionId || !fetchedBotInfo || activeConversation) {
      return;
    }

    getOrCreateConversation(
      {
        botId,
        sessionId: anonymousSessionId,
      },
      {
        onSuccess: (conversation: PublicBotConversation) => {
          setActiveConversation(conversation);
        },
        onError: (error: Error) => {
          console.error('Failed to get or create conversation:', error);
        },
      }
    );
  }, [
    botId,
    anonymousSessionId,
    fetchedBotInfo,
    activeConversation,
    getOrCreateConversation,
    setActiveConversation,
  ]);

  // Connect Socket.IO when we have both session ID and conversation ID
  // Public bots use Socket.IO with session auth - one connection per conversation
  useEffect(() => {
    if (!anonymousSessionId || !activeConversation?.dareConversationId) {
      return;
    }

    // Get actions from store state to avoid dependency issues
    const { connect, isConnected, isConnecting } = usePublicWebSocketStore.getState();

    // Only connect if not already connected or connecting
    if (!isConnected && !isConnecting) {
      connect(activeConversation.dareConversationId, anonymousSessionId);
    }

    // Cleanup on unmount
    return () => {
      const { isConnected: stillConnected, disconnect: disc } = usePublicWebSocketStore.getState();
      if (stillConnected) {
        disc();
      }
    };
  }, [anonymousSessionId, activeConversation?.dareConversationId]);

  // Handle sending messages
  const handleSendMessage = useCallback(
    (message: string) => {
      if (!activeConversation || !botInfo) return;

      setSocketError(null);
      setIsTyping(true);
      addMessage({
        id: `pending-${crypto.randomUUID()}`,
        message,
        senderType: 'USER',
        senderName: '',
        isSender: true,
        date: new Date().toISOString(),
        streaming: false,
      });

      const selectedModelId = botInfo.modelPreference?.chatModelDareId;
      if (!selectedModelId) {
        setIsTyping(false);
        setSocketError(
          'This bot does not have an AI model selected. Please ask the bot owner to choose a model.'
        );
        return;
      }

      // Build payload exactly like authenticated bot chat
      // conversationId is REQUIRED - backend uses it to route the message
      const payload: Record<string, unknown> = {
        conversationId: activeConversation.dareConversationId,
        message: message,
        sender_type: 1, // USER
        enable_progress: true, // Enable progress tracking for public bots
        is_advanced: Boolean(botInfo.isAdvanced || false),
      };

      // LLM and context settings (matching conversationStore.ts structure exactly)
      payload.model_id = selectedModelId;
      payload.rag_mode = botInfo.ragMode || 'advanced';
      payload.embedding_ids = botInfo.dareFileIds || [];
      payload.file_owner_id = botInfo.createdByDareId;
      payload.progress_llm_id = botInfo.modelPreference?.trackingModelDareId;
      payload.web_search_enabled = Boolean(botInfo.webSearchEnabled || false);

      if (botInfo.maxContextSnippets !== undefined) {
        payload.max_context_snippets = botInfo.maxContextSnippets;
      }
      if (botInfo.documentSimilarityThreshold !== undefined) {
        payload.document_similarity_threshold = botInfo.documentSimilarityThreshold;
      }

      // Add bot metadata (must match conversationStore.ts payload exactly)
      payload.bot_meta = {
        title: botInfo.title,
        subject: botInfo.subject,
        topic: botInfo.topic,
        chat_prompt: botInfo.prompts?.chatPrompt,
        tracking_prompt: botInfo.prompts?.trackingPrompt,
        learning_goals: botInfo.prompts?.learningGoals,
      };

      sendWebSocketMessage(payload);
    },
    [activeConversation, addMessage, botInfo, setIsTyping, sendWebSocketMessage, setSocketError]
  );

  // Reset conversation: drop the anonymous session and start a fresh one.
  // The conversation-create and socket effects re-run automatically once
  // activeConversation is cleared and the session id changes.
  const handleResetConversation = useCallback(() => {
    usePublicWebSocketStore.getState().disconnect();
    clearAnonymousSession();
    const newSession = getOrCreateAnonymousSession();
    usePublicBotStore.setState({
      messages: [],
      activeConversation: null,
      isTyping: false,
      anonymousSessionId: newSession,
    });
    setResetConfirmOpen(false);
  }, []);

  // Loading state
  const isLoading = isLoadingBotInfo || isCreatingConversation;

  // Error state
  const error = botInfoError || conversationError;

  if (isLoading) {
    return (
      <div className="from-background to-secondary/20 flex min-h-screen items-center justify-center bg-gradient-to-br">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            <Loader2 className="text-primary h-12 w-12 animate-spin" />
            <p className="text-muted-foreground">Loading bot...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="from-background to-secondary/20 flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error instanceof Error ? error.message : 'An unexpected error occurred'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!botInfo) {
    return null;
  }

  return (
    <div className="from-background to-secondary/20 flex h-screen flex-col bg-gradient-to-br">
      {/* Header - Uses global theme */}
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 flex-shrink-0 border-b backdrop-blur">
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
            <BotIcon className="text-primary h-5 w-5" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">{botInfo.title}</h1>
            <p className="text-muted-foreground text-sm">
              {botInfo.subject} • {botInfo.topic}
            </p>
          </div>
          {botInfo.budget !== null && botInfo.budget !== undefined && (
            <div className="text-muted-foreground hidden text-right text-sm md:block">
              <div className="font-mono">
                $
                {(
                  parseFloat(String(botInfo.budget)) - parseFloat(String(botInfo.budgetUsed || 0))
                ).toFixed(2)}
              </div>
              <div className="text-xs">Budget Remaining</div>
            </div>
          )}
          {/* Reset Conversation */}
          <button
            onClick={() => setResetConfirmOpen(true)}
            className="text-destructive hover:bg-destructive/10 border-border/60 bg-background/80 flex h-10 w-10 items-center justify-center rounded-lg border shadow-sm transition-colors"
            aria-label="Reset conversation"
            title="Reset conversation and learning progress"
          >
            <Trash2 className="h-5 w-5" />
          </button>
          {/* Dark/Light Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="bg-background/80 hover:bg-background border-border/60 flex h-10 w-10 items-center justify-center rounded-lg border shadow-sm transition-colors"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? (
              <Sun className="text-foreground h-5 w-5" />
            ) : (
              <Moon className="text-foreground h-5 w-5" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content - Sidebar + Chat */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Tracking Sidebar on LEFT - Only show if tracking is enabled */}
        {isTrackingEnabled && isProgressSidebarVisible && (
          <div className="border-border/60 bg-background/90 w-80 min-w-0 flex-shrink-0 overflow-y-auto border-r backdrop-blur-sm">
            <PublicTrackingSidebar />
          </div>
        )}

        {/* Chat Interface - Uses bot theme */}
        <main
          id="bot-chat-root"
          className={`relative container mx-auto flex flex-1 flex-col overflow-hidden p-4 ${fontClass} ${textSizeClass}`}
        >
          {/* Drawer Toggle Button - Top Left of Chat - Only show if tracking is enabled */}
          {isTrackingEnabled && (
            <button
              onClick={() => setProgressSidebarVisible(!isProgressSidebarVisible)}
              className="bg-background hover:bg-muted border-border/60 absolute top-6 left-6 z-50 flex h-8 w-8 items-center justify-center rounded-lg border shadow-md transition-colors"
              aria-label={isProgressSidebarVisible ? 'Hide progress' : 'Show progress'}
              title={isProgressSidebarVisible ? 'Hide Learning Progress' : 'Show Learning Progress'}
            >
              {isProgressSidebarVisible ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}

          <Card className="flex h-full flex-col overflow-hidden">
            <CardContent className="flex h-full flex-col overflow-hidden !p-0">
              {/* Messages - Takes remaining space and scrolls */}
              <PublicMessageList
                className={`min-h-0 flex-1 ${spacingClass}`}
                roundedClass={roundedClass}
              />

              {socketError && (
                <ChatErrorAlert message={socketError} onDismiss={() => setSocketError(null)} />
              )}

              {/* Input - Fixed at bottom */}
              <PublicChatInput onSendMessage={handleSendMessage} roundedClass={roundedClass} />
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Reset confirmation dialog */}
      <Dialog open={isResetConfirmOpen} onOpenChange={setResetConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="bg-destructive/10 flex h-10 w-10 items-center justify-center rounded-full">
                <AlertTriangle className="text-destructive h-5 w-5" />
              </div>
              <DialogTitle className="text-lg font-semibold">Reset Conversation</DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground pt-2">
              This will clear all messages and learning progress and start a brand-new conversation.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setResetConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleResetConversation}>
              <Trash2 className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer - Uses global theme */}
      <footer className="bg-background/95 supports-[backdrop-filter]:bg-background/60 flex-shrink-0 border-t backdrop-blur">
        <div className="text-muted-foreground container mx-auto px-4 py-3 text-center text-xs">
          Powered by Socratic Bots • Public Bot Chat
        </div>
      </footer>
    </div>
  );
};

export default PublicBotChat;
