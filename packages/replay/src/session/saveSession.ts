import { REPLAY_SESSION_KEY, WINDOW } from '../constants.ts';
import type { Session } from '../types.ts';
import { hasSessionStorage } from '../util/hasSessionStorage.ts';

/**
 * Save a session to session storage.
 */
export function saveSession(session: Session): void {
  if (!hasSessionStorage()) {
    return;
  }

  try {
    WINDOW.sessionStorage.setItem(REPLAY_SESSION_KEY, JSON.stringify(session));
  } catch {
    // Ignore potential SecurityError exceptions
  }
}
