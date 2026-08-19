// Crash reporting via Sentry. Wordt alleen geactiveerd als er een DSN is
// ingesteld (env SENTRY_DSN), zodat de app zonder configuratie gewoon werkt.
// Privacy: geen PII, en we sturen bewust geen berichtinhoud mee.
import * as Sentry from '@sentry/react';

const DSN = process.env.SENTRY_DSN || '';

let started = false;

export function initMonitoring(): void {
  if (started || !DSN) return;
  try {
    Sentry.init({
      dsn: DSN,
      environment: 'production',
      sendDefaultPii: false,
      // Alleen echte fouten; geen session replay of PII.
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
    });
    started = true;
  } catch {
    /* monitoring mag de app nooit breken */
  }
}

export function captureError(err: unknown, context?: Record<string, unknown>): void {
  if (!DSN) {
    if (context) console.error(err, context);
    else console.error(err);
    return;
  }
  try {
    Sentry.captureException(err, context ? { extra: context } : undefined);
  } catch {
    /* stil */
  }
}
