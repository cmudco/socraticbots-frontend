// Run on the local Vite origin with:
// await (await import('/tests/chat-socket-completion.js')).runChatSocketCompletionTests()
import { useConversationStore } from '../src/stores/core/conversationStore.ts';
import { usePublicBotStore } from '../src/stores/core/publicBotStore.ts';
import { usePublicWebSocketStore } from '../src/stores/core/publicWebSocketStore.ts';
import { useWebSocketStore } from '../src/stores/core/websocketStore.ts';

const settle = () => new Promise(resolve => setTimeout(resolve, 100));
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

export async function runChatSocketCompletionTests() {
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
          conversationHistory: [{ id: userId, message: 'hi', senderType: 1 }],
        });
        await settle();
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
        results.push(`${name}: ${typeof userId} history IDs, completion and second send passed`);
      }
    } finally {
      chat.setState(originalChat, true);
      socket.setState(originalSocket, true);
    }
  }
  return results;
}
