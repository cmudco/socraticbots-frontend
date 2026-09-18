import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import { canViewBotMessageDetails } from '@/utils/messageDetailsAccess';
import { isProgressTrackingConfigured } from '@/utils/progressTracking';

import ChatMessageBubble from '@/components/chat/shared/ChatMessageBubble';

export function runMessageDetailsChecks() {
  const assert = (condition: boolean, message: string) => {
    if (!condition) throw new Error(message);
  };
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const message = {
    id: 'test',
    message: 'Answer',
    date: new Date().toISOString(),
    senderType: 'ASSISTANT' as const,
  };
  try {
    for (const [name, viewer, expected] of [
      ['creator', { id: 1 }, true],
      ['subscriber', { id: 2 }, false],
      ['anonymous', null, false],
    ] as const) {
      const allowed = canViewBotMessageDetails({ createdById: 1 }, viewer);
      assert(allowed === expected, `${name}: wrong ownership gate`);
      flushSync(() =>
        root.render(
          <ChatMessageBubble
            message={message}
            canViewDetails={allowed}
            contextTrace={{ totalMs: 1, stages: [{ kind: 'prompt', chars: 10 }] }}
          />
        )
      );
      assert(
        Boolean(container.querySelector('[aria-label="Message details"]')) === expected,
        `${name}: incorrect info-button visibility`
      );
      assert(!container.textContent?.includes('Context'), `${name}: context remains inside bubble`);
    }
    flushSync(() => root.render(<ChatMessageBubble message={message} variant="botTheme" />));
    assert(
      !container.querySelector('[aria-label="Message details"]'),
      'Public chat exposes diagnostics'
    );
    const complete = {
      modelPreference: { trackingModelDareId: '1' },
      prompts: { learningGoals: 'Learn', trackingPrompt: 'Assess' },
    };
    assert(isProgressTrackingConfigured(complete), 'Complete tracking was disabled');
    for (const missing of [undefined, null, '', ' \n']) {
      assert(
        !isProgressTrackingConfigured({
          ...complete,
          prompts: { ...complete.prompts, learningGoals: missing },
        }),
        'Missing goals enable tracking'
      );
      assert(
        !isProgressTrackingConfigured({
          ...complete,
          prompts: { ...complete.prompts, trackingPrompt: missing },
        }),
        'Missing prompt enables tracking'
      );
    }
    assert(
      !isProgressTrackingConfigured({ prompts: complete.prompts }),
      'Missing model enables tracking'
    );
    return 'Creator/subscriber/public visibility, inline-context removal, and optional tracking checks passed';
  } finally {
    root.unmount();
    container.remove();
  }
}
