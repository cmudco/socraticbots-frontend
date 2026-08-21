import * as Sentry from '@sentry/react';

const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;

export const sentryEnabled = Boolean(dsn);

export function initSentry(): void {
  if (!dsn) return;
  Sentry.init({
    dsn,
    environment:
      (import.meta.env.VITE_SENTRY_ENVIRONMENT as string | undefined) || import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({ maskAllInputs: true, blockAllMedia: true }),
    ],
    tracesSampleRate: 0.2,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

/** Tag the current scope with the voice session so browser errors join the runtime's events. */
export function tagVoiceSession(sessionId: string | null): void {
  Sentry.setTag('voice_session_id', sessionId ?? undefined);
}

export function captureVoiceError(error: Error, extra?: Record<string, unknown>): void {
  Sentry.captureException(error, { tags: { area: 'voice' }, extra });
}

export { Sentry };
