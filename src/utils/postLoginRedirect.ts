/**
 * Where to send a user after their next sign-in.
 *
 * Registration with a voice-assignment code ends with an email-verification
 * round trip, so the landing page cannot ride along in router state alone; it
 * is also kept in localStorage until the first successful login consumes it.
 */
import type { VoiceAssignmentSummary } from '@/services/auth.service';

const STORAGE_KEY = 'post_login_redirect';

export const VOICE_ASSIGNMENTS_PATH = '/voice-exams';

/** The assignment itself when the code unlocked one, the list to pick from otherwise. */
export const voiceSignupLandingPath = (assignments: VoiceAssignmentSummary[]): string =>
  assignments.length === 1
    ? `${VOICE_ASSIGNMENTS_PATH}/${assignments[0].id}`
    : VOICE_ASSIGNMENTS_PATH;

export const rememberPostLoginRedirect = (path: string): void => {
  try {
    localStorage.setItem(STORAGE_KEY, path);
  } catch {
    // Storage unavailable (private mode, disabled): router state still carries the path.
  }
};

/** Returns the remembered in-app path once, then forgets it. External URLs are ignored. */
export const consumePostLoginRedirect = (): string | null => {
  try {
    const path = localStorage.getItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
    return path && path.startsWith('/') && !path.startsWith('//') ? path : null;
  } catch {
    return null;
  }
};
