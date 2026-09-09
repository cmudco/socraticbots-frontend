import { getSocketOptions, getSocketUrl } from '../src/config/socket.config.ts';
import { authenticatedSocketService, publicSocketService } from '../src/services/socket.service.ts';
import { usePublicWebSocketStore } from '../src/stores/core/publicWebSocketStore.ts';
import { useWebSocketStore } from '../src/stores/core/websocketStore.ts';
import { buildBotChatPayload } from '../src/utils/botChatPayload.ts';

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

export function runChatWireContractChecks() {
  const fixtures = [];
  for (const ragMode of ['naive', 'advanced', 'agentic']) {
    for (const modelId of ['29', 'litellm:test-key:provider/model']) {
      const bot = {
        title: 'Contract bot',
        subject: 'OOP',
        topic: 'Classes',
        dareFileIds: [71, 72],
        createdByDareId: 9,
        ragMode,
        modelPreference: { chatModelDareId: modelId, trackingModelDareId: '31' },
        prompts: { chatPrompt: 'Teach', trackingPrompt: 'Assess', learningGoals: 'Classes' },
        isAdvanced: true,
        webSearchEnabled: true,
        maxContextSnippets: 12,
        documentSimilarityThreshold: 0,
      };
      const payload = buildBotChatPayload(bot, 'Explain a class');
      assert(payload.model_id === modelId, 'Opaque model ID changed');
      assert(payload.rag_mode === ragMode, 'Retrieval mode changed');
      assert(payload.document_similarity_threshold === 0, 'Zero threshold lost');
      assert(
        payload.bot_meta.tracking_prompt === 'Assess' && payload.enable_progress,
        'Tracking contract mismatch'
      );
      assert(
        !('llm_id' in payload) && !('learning_goals' in payload),
        'Legacy configuration leaked'
      );
      const captured = [];
      for (const [store, service] of [
        [useWebSocketStore, authenticatedSocketService],
        [usePublicWebSocketStore, publicSocketService],
      ]) {
        const previousState = store.getState();
        const previousSend = service.sendMessage;
        try {
          store.setState({ isConnected: true, currentConversationId: 'contract-room' });
          service.sendMessage = data => captured.push(JSON.parse(JSON.stringify(data)));
          store.getState().sendMessage({ ...payload, conversationId: 'stale-room' });
        } finally {
          service.sendMessage = previousSend;
          store.setState(previousState, true);
        }
      }
      assert(
        JSON.stringify(captured[0]) === JSON.stringify(captured[1]),
        'Authenticated/public wire payloads differ'
      );
      assert(
        captured[0].conversationId === 'contract-room',
        'Stale routing ID overrode active room'
      );
      fixtures.push(captured[0]);
    }
  }
  const defaults = buildBotChatPayload(
    { title: 'Empty', subject: '', topic: '', prompts: { trackingPrompt: ' ', learningGoals: '' } },
    'Hi'
  );
  assert(
    defaults.rag_mode === 'advanced' && !defaults.enable_progress,
    'Default/optional configuration mismatch'
  );
  assert(getSocketUrl().endsWith('/chat'), 'Wrong namespace');
  const publicAuth = { sessionId: 'session', conversationId: 'room' };
  assert(getSocketOptions(publicAuth).auth === publicAuth, 'Public auth shape changed');
  assert(getSocketOptions({ token: 'test' }).path === '/socket.io/', 'Wrong socket path');
  return { passed: true, fixtures };
}
