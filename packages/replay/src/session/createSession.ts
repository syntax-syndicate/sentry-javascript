import type { Sampled, Session, SessionOptions } from '../types.ts';
import { isSampled } from '../util/isSampled.ts';
import { saveSession } from './saveSession.ts';
import { makeSession } from './Session.ts';

/**
 * Get the sampled status for a session based on sample rates & current sampled status.
 */
export function getSessionSampleType(sessionSampleRate: number, allowBuffering: boolean): Sampled {
  return isSampled(sessionSampleRate) ? 'session' : allowBuffering ? 'buffer' : false;
}

/**
 * Create a new session, which in its current implementation is a Sentry event
 * that all replays will be saved to as attachments. Currently, we only expect
 * one of these Sentry events per "replay session".
 */
export function createSession({ sessionSampleRate, allowBuffering, stickySession = false }: SessionOptions): Session {
  const sampled = getSessionSampleType(sessionSampleRate, allowBuffering);
  const session = makeSession({
    sampled,
  });

  if (stickySession) {
    saveSession(session);
  }

  return session;
}
