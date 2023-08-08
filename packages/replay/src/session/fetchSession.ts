import { REPLAY_SESSION_KEY, WINDOW } from '../constants.ts';
import type { Session } from '../types.ts';
import { hasSessionStorage } from '../util/hasSessionStorage.ts';
import { logInfo } from '../util/log.ts';
import { makeSession } from './Session.ts';

/**
 * Fetches a session from storage
 */
export function fetchSession(traceInternals?: boolean): Session | null {
  if (!hasSessionStorage()) {
    return null;
  }

  try {
    // This can throw if cookies are disabled
    const sessionStringFromStorage = WINDOW.sessionStorage.getItem(REPLAY_SESSION_KEY);

    if (!sessionStringFromStorage) {
      return null;
    }

    const sessionObj = JSON.parse(sessionStringFromStorage) as Session;

    logInfo('[Replay] Loading existing session', traceInternals);

    return makeSession(sessionObj);
  } catch {
    return null;
  }
}
