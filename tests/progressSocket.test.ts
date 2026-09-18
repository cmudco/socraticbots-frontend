// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useConversationStore } from '@/stores/core/conversationStore';
import { usePublicBotStore } from '@/stores/core/publicBotStore';
import { usePublicWebSocketStore } from '@/stores/core/publicWebSocketStore';
import { useWebSocketStore } from '@/stores/core/websocketStore';

import type { SocketMessage } from '@/types/socket';

describe.each([
  ['authenticated', useConversationStore, useWebSocketStore],
  ['public', usePublicBotStore, usePublicWebSocketStore],
] as const)('%s progress socket contract', (_name, chat, socket) => {
  const originalChat = chat.getState();
  const originalSocket = socket.getState();

  afterEach(() => {
    chat.setState(originalChat, true);
    socket.setState(originalSocket, true);
  });

  async function receive(event: SocketMessage) {
    socket.getState().handleSocketMessage(event);
    // Both stores resolve their message target through a lazy import.
    await vi.dynamicImportSettled();
  }

  it('renders progress tokens arriving after the completed assistant response', async () => {
    chat.setState({ messages: [], isTyping: true });
    socket.setState({ currentConversationId: 'OQ48N' });
    socket.getState().clearProgressTokens();
    await receive({ type: 'ai_stream', id: 42241, message: 'Hey there!', senderType: 2 });
    await receive({
      type: 'message',
      id: 42241,
      message: 'Hey there!',
      senderType: 2,
      streaming: false,
    });
    expect(chat.getState().isTyping).toBe(false);

    // No progress_start is required by DARE's live progress protocol.
    for (const chunk of ['##', ' Progress Report\n\n', '- ✅ Emotion']) {
      await receive({
        type: 'progress_stream',
        conversationId: 'OQ48N',
        messageId: '42241',
        chunk,
      });
    }
    expect(socket.getState().isProgressStreaming).toBe(true);
    expect(socket.getState().progressTokens.join('')).toBe('## Progress Report\n\n- ✅ Emotion');
    await receive({
      type: 'progress_complete',
      conversationId: 'OQ48N',
      messageId: '42241',
      inputTokens: 2370,
      outputTokens: 183,
    });
    expect(socket.getState().isProgressStreaming).toBe(false);
    expect(socket.getState().progressTokens.join('')).toBe('## Progress Report\n\n- ✅ Emotion');
    expect(chat.getState().messages).toHaveLength(1);
  });

  it('restores saved progress with the subscription ID', async () => {
    socket.setState({ currentConversationId: 'OQ48N' });
    socket.getState().clearProgressTokens();
    await receive({
      type: 'latest_progress',
      conversationId: 'OQ48N',
      assessment: { id: '3392', content: '## Saved Progress' },
    } as SocketMessage);
    expect(socket.getState().progressTokens.join('')).toBe('## Saved Progress');
    expect(socket.getState().isProgressStreaming).toBe(false);
  });

  it('rejects mismatched IDs and events pending during a conversation switch', async () => {
    socket.setState({ currentConversationId: 'OQ48N' });
    socket.getState().clearProgressTokens();
    for (const conversationId of ['5569', 'OTHER']) {
      await receive({
        type: 'progress_stream',
        conversationId,
        messageId: '42241',
        chunk: 'stale',
      });
      await receive({
        type: 'latest_progress',
        conversationId,
        assessment: { id: '3392', content: 'stale' },
      } as SocketMessage);
    }
    expect(socket.getState().progressTokens).toEqual([]);

    socket.getState().handleSocketMessage({
      type: 'progress_stream',
      conversationId: 'OQ48N',
      messageId: '42241',
      chunk: 'stale',
    });
    socket.setState({ currentConversationId: 'NEW' });
    await vi.dynamicImportSettled();
    expect(socket.getState().progressTokens).toEqual([]);
    expect(socket.getState().isProgressStreaming).toBe(false);
  });
});
