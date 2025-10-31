import React, { useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { AlertCircle, Bot as BotIcon, Loader2 } from 'lucide-react';

import { useGetOrCreateConversation, usePublicBotInfo } from '@/hooks/queries/usePublicBot';

import { usePublicBotStore } from '@/stores/core/publicBotStore';
import { usePublicWebSocketStore } from '@/stores/core/publicWebSocketStore';

import { getOrCreateAnonymousSession } from '@/lib/anonymousSession';

import PublicChatInput from '@/components/chat/public/PublicChatInput';
import PublicMessageList from '@/components/chat/public/PublicMessageList';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';

import type { PublicBotConversation } from '@/types/publicBot';

const PublicBotChat: React.FC = () => {
  const { botId } = useParams<{ botId: string }>();

  // Zustand stores
  const {
    setBotInfo,
    setActiveConversation,
    setAnonymousSessionId,
    setIsTyping,
    anonymousSessionId,
    botInfo,
    activeConversation,
  } = usePublicBotStore();

  const {
    connect: connectWebSocket,
    disconnect: disconnectWebSocket,
    sendMessage: sendWebSocketMessage,
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

  // Connect WebSocket when we have conversation ID and session ID
  useEffect(() => {
    if (!activeConversation?.dareConversationId || !anonymousSessionId) {
      return;
    }

    connectWebSocket(activeConversation.dareConversationId, anonymousSessionId).catch(error => {
      console.error('Failed to connect WebSocket:', error);
    });

    // Cleanup on unmount
    return () => {
      disconnectWebSocket();
    };
  }, [
    activeConversation?.dareConversationId,
    anonymousSessionId,
    connectWebSocket,
    disconnectWebSocket,
  ]);

  // Handle sending messages
  const handleSendMessage = useCallback(
    (message: string) => {
      if (!activeConversation || !botInfo) return;

      setIsTyping(true);

      // Build payload exactly like authenticated bot chat
      const payload: Record<string, unknown> = {
        message: message,
        sender_type: 1, // USER
        enable_progress: false, // No progress tracking for public bots
        is_advanced: Boolean(botInfo.isAdvanced || false),
      };

      // Add all bot-specific settings
      if (botInfo.modelPreference?.chatModelDareId) {
        payload.llm_id = botInfo.modelPreference.chatModelDareId;
      }
      if (botInfo.dareFileIds) {
        payload.file_ids = botInfo.dareFileIds;
      }
      if (botInfo.webSearchEnabled !== undefined) {
        payload.web_search_enabled = Boolean(botInfo.webSearchEnabled);
      }
      if (botInfo.maxContextSnippets !== undefined) {
        payload.max_context_snippets = botInfo.maxContextSnippets;
      }
      if (botInfo.documentSimilarityThreshold !== undefined) {
        payload.document_similarity_threshold = botInfo.documentSimilarityThreshold;
      }

      // Add bot metadata
      payload.bot_meta = {
        title: botInfo.title,
        subject: botInfo.subject,
        topic: botInfo.topic,
        learning_goals: botInfo.prompts?.learningGoals,
        chat_prompt: botInfo.prompts?.chatPrompt,
      };

      sendWebSocketMessage(payload);
    },
    [activeConversation, botInfo, setIsTyping, sendWebSocketMessage]
  );

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
      {/* Header */}
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
        </div>
      </header>

      {/* Chat Interface */}
      <main className="container mx-auto flex flex-1 flex-col overflow-hidden p-4">
        <Card className="flex h-full flex-col overflow-hidden">
          <CardContent className="flex h-full flex-col overflow-hidden p-0">
            {/* Messages - Takes remaining space and scrolls */}
            <PublicMessageList className="min-h-0 flex-1" />

            {/* Input - Fixed at bottom */}
            <PublicChatInput onSendMessage={handleSendMessage} className="flex-shrink-0" />
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-background/95 supports-[backdrop-filter]:bg-background/60 flex-shrink-0 border-t backdrop-blur">
        <div className="text-muted-foreground container mx-auto px-4 py-3 text-center text-xs">
          Powered by Socratic Books • Public Bot Chat
        </div>
      </footer>
    </div>
  );
};

export default PublicBotChat;
