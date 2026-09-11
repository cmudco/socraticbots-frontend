import * as Sentry from '@sentry/react';

// Local testing must explicitly opt in to its own project; never reuse prod DSN.
const dsn = (
  import.meta.env.DEV ? import.meta.env.VITE_LOCAL_SENTRY_DSN : import.meta.env.VITE_SENTRY_DSN
) as string | undefined;

export const sentryEnabled = Boolean(dsn);

export function initSentry(): void {
  if (!dsn) return;
  Sentry.init({
    dsn,
    environment:
      (import.meta.env.VITE_SENTRY_ENVIRONMENT as string | undefined) || import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      ...(import.meta.env.DEV
        ? []
        : [
            Sentry.replayIntegration({
              maskAllText: true,
              maskAllInputs: true,
              blockAllMedia: true,
            }),
          ]),
    ],
    tracesSampleRate: import.meta.env.DEV ? 0 : 0.2,
    replaysSessionSampleRate: import.meta.env.DEV ? 0 : 0.1,
    replaysOnErrorSampleRate: import.meta.env.DEV ? 0 : 1.0,
    sendDefaultPii: false,
    beforeSend: import.meta.env.DEV
      ? event => ({
          type: event.type,
          event_id: event.event_id,
          timestamp: event.timestamp,
          level: event.level,
          environment: 'development',
          platform: event.platform,
          message: 'Local frontend error (payload omitted)',
          exception: {
            values: event.exception?.values?.map(value => ({
              type: value.type,
              value: 'Local error (message omitted)',
              stacktrace: {
                frames: value.stacktrace?.frames?.map(frame => ({
                  filename: frame.filename?.split('?')[0],
                  function: frame.function,
                  lineno: frame.lineno,
                  colno: frame.colno,
                })),
              },
            })),
          },
        })
      : undefined,
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
