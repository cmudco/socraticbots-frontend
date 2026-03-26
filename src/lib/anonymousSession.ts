/**
 * Anonymous session management for public bot chat
 */

const ANONYMOUS_SESSION_KEY = 'socratic_anonymous_session_id';

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create an anonymous session ID
 * Stored in localStorage to persist across page reloads
 */
export function getOrCreateAnonymousSession(): string {
  try {
    const existingSession = localStorage.getItem(ANONYMOUS_SESSION_KEY);

    if (existingSession) {
      return existingSession;
    }

    const newSession = generateUUID();
    localStorage.setItem(ANONYMOUS_SESSION_KEY, newSession);
    return newSession;
  } catch (error) {
    // If localStorage fails, use in-memory session (will be lost on reload)
    console.error('Failed to access localStorage:', error);
    return generateUUID();
  }
}

/**
 * Clear the anonymous session (for testing purposes)
 */
export function clearAnonymousSession(): void {
  try {
    localStorage.removeItem(ANONYMOUS_SESSION_KEY);
  } catch (error) {
    console.error('Failed to clear anonymous session:', error);
  }
}

/**
 * Get the current session ID without creating a new one
 */
export function getAnonymousSession(): string | null {
  try {
    return localStorage.getItem(ANONYMOUS_SESSION_KEY);
  } catch (error) {
    console.error('Failed to get anonymous session:', error);
    return null;
  }
}
