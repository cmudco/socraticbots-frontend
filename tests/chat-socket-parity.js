// Run on the local Vite origin with:
// await (await import('/tests/chat-socket-parity.js')).runChatSocketParityTests()
import { useConversationStore } from '../src/stores/core/conversationStore.ts';
import { usePublicBotStore } from '../src/stores/core/publicBotStore.ts';
import { usePublicWebSocketStore } from '../src/stores/core/publicWebSocketStore.ts';
import { useWebSocketStore } from '../src/stores/core/websocketStore.ts';

const settle = () => new Promise(resolve => setTimeout(resolve, 100));
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

export async function runChatSocketParityTests() {
  const results = [];
  for (const [name, chat, socket] of [
    ['authenticated', useConversationStore, useWebSocketStore],
    ['public', usePublicBotStore, usePublicWebSocketStore],
  ]) {
    const originalChat = chat.getState();
    const originalSocket = socket.getState();
    try {
      for (const userId of [101, '101']) {
        chat.setState({ messages: [], isTyping: false });
        socket.getState().handleSocketMessage({
          type: 'conversation_history',
          conversationHistory: [
            {
              id: userId,
              message: 'hi',
              senderType: 1,
              createdAt: '2026-08-01T09:00:00Z',
              sender: 'History sender',
              llm: 29,
              cost: '0.012345',
              snippets: [
                {
                  id: 1,
                  text: 'Evidence',
                  file: { id: 1, name: 'Notes' },
                  chunkIndex: 0,
                  similarityScore: 0.7,
                },
              ],
              retrievalTrace: { traces: [] },
              webSearchSources: [{ id: 1, title: 'Source', url: 'https://example.com' }],
            },
          ],
        });
        await settle();
        assert(
          chat.getState().messages[0].date === '2026-08-01T09:00:00Z',
          `${name}: history timestamp changed`
        );
        assert(
          chat.getState().messages[0].senderName === 'History sender',
          `${name}: history sender lost`
        );
        assert(chat.getState().messages[0].llmId === 29, `${name}: persisted model ID lost`);
        assert(
          String(chat.getState().messages[0].cost) === '0.012345',
          `${name}: decimal cost lost`
        );
        {
          assert(
            chat.getState().messages[0].snippets?.[0].text === 'Evidence',
            'History snippets were discarded'
          );
          assert(
            chat.getState().messages[0].retrievalTrace?.traces.length === 0,
            'History trace was discarded'
          );
          assert(
            chat.getState().messages[0].webSearchSources?.[0].title === 'Source',
            'Web sources were discarded'
          );
        }
        chat.setState({ isTyping: true });
        socket.getState().handleSocketMessage({
          type: 'ai_stream',
          id: 102,
          message: 'Hello',
          senderType: 2,
          streaming: true,
        });
        await settle();
        assert(chat.getState().messages[1].streaming, `${name}: response should stream`);
        socket.getState().handleSocketMessage({
          type: 'message',
          id: 102,
          message: 'Hello!',
          senderType: 2,
          streaming: false,
        });
        await settle();
        const completed = chat.getState();
        assert(!completed.isTyping, `${name}: composer remains locked for ${typeof userId} IDs`);
        assert(completed.messages.length === 2, `${name}: duplicate assistant response`);
        assert(!completed.messages[1].streaming, `${name}: spinner remains active`);
        assert(completed.messages[1].message === 'Hello!', `${name}: final content was lost`);

        // A second send must still reconcile its optimistic bubble even when
        // older history and assistant replies have numeric database IDs.
        chat.getState().addMessage({
          id: 'pending-next',
          message: 'next',
          senderType: 'USER',
          streaming: false,
        });
        socket.getState().handleSocketMessage({
          type: 'message',
          id: 103,
          message: 'next',
          senderType: 1,
          streaming: false,
        });
        await settle();
        assert(chat.getState().messages.length === 3, `${name}: duplicate user bubble`);
        assert(chat.getState().messages[2].id === '103', `${name}: pending ID was not replaced`);
        chat.setState({ isTyping: true });
        socket.getState().handleSocketMessage({
          type: 'message',
          id: 104,
          message: 'echo',
          senderType: 1,
          streaming: false,
        });
        await settle();
        assert(chat.getState().isTyping, `${name}: user echo unlocked composer too early`);
        socket.getState().handleSocketMessage({
          type: 'tool_call_pending',
          messageId: 105,
          toolCallId: 'call',
          toolName: 'search_documents',
        });
        socket.getState().handleSocketMessage({
          type: 'context_trace',
          messageId: 105,
          trace: { totalMs: 4, stages: [{ kind: 'retrieval', mode: 'agentic', ms: 4 }] },
        });
        await settle();
        assert(
          socket.getState().toolCallsByMessage['105'][0].toolName === 'search_documents',
          `${name}: tool activity missing`
        );
        assert(
          socket.getState().contextTraceByMessage['105'].stages.length === 1,
          `${name}: trace missing`
        );
        socket
          .getState()
          .handleSocketMessage({ type: 'ai_stream', id: 105, message: 'partial', senderType: 2 });
        await settle();
        assert(chat.getState().isTyping, `${name}: stream without legacy flag unlocked composer`);
        socket
          .getState()
          .handleSocketMessage({ type: 'error', errorMessage: 'Provider unavailable' });
        await settle();
        assert(
          !chat.getState().isTyping && !chat.getState().messages.some(m => m.streaming),
          `${name}: error left active stream`
        );
        assert(socket.getState().error === 'Provider unavailable', `${name}: error not shown`);
        socket.getState().handleSocketMessage({ type: 'progress_start' });
        await settle();
        assert(socket.getState().isProgressStreaming, `${name}: progress start immediately reset`);
        socket.setState({ currentConversationId: 'old' });
        socket
          .getState()
          .handleSocketMessage({ type: 'message', id: 999, message: 'stale', senderType: 2 });
        socket.setState({ currentConversationId: 'new' });
        await settle();
        assert(
          !chat.getState().messages.some(m => m.message === 'stale'),
          `${name}: stale conversation event applied`
        );
        socket.setState({ currentConversationId: null });
        results.push(`${name}: ${typeof userId} history IDs, completion and second send passed`);
      }
    } finally {
      chat.setState(originalChat, true);
      socket.setState(originalSocket, true);
    }
  }
  return results;
}
