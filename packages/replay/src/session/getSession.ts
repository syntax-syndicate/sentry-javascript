import type { Session, SessionOptions, Timeouts } from '../types.ts';
import { isSessionExpired } from '../util/isSessionExpired.ts';
import { logInfo } from '../util/log.ts';
import { createSession } from './createSession.ts';
import { fetchSession } from './fetchSession.ts';
import { makeSession } from './Session.ts';

interface GetSessionParams extends SessionOptions {
  timeouts: Timeouts;

  /**
   * The current session (e.g. if stickySession is off)
   */
  currentSession?: Session;

  traceInternals?: boolean;
}

/**
 * Get or create a session
 */
export function getSession({
  timeouts,
  currentSession,
  stickySession,
  sessionSampleRate,
  allowBuffering,
  traceInternals,
}: GetSessionParams): { type: 'new' | 'saved'; session: Session } {
  // If session exists and is passed, use it instead of always hitting session storage
  const session = currentSession || (stickySession && fetchSession(traceInternals));

  if (session) {
    // If there is a session, check if it is valid (e.g. "last activity" time
    // should be within the "session idle time", and "session started" time is
    // within "max session time").
    const isExpired = isSessionExpired(session, timeouts);

    if (!isExpired || (allowBuffering && session.shouldRefresh)) {
      return { type: 'saved', session };
    } else if (!session.shouldRefresh) {
      // This is the case if we have an error session that is completed
      // (=triggered an error). Session will continue as session-based replay,
      // and when this session is expired, it will not be renewed until user
      // reloads.
      const discardedSession = makeSession({ sampled: false });
      logInfo('[Replay] Session should not be refreshed', traceInternals);
      return { type: 'new', session: discardedSession };
    } else {
      logInfo('[Replay] Session has expired', traceInternals);
    }
    // Otherwise continue to create a new session
  }

  const newSession = createSession({
    stickySession,
    sessionSampleRate,
    allowBuffering,
  });
  logInfo('[Replay] Created new session', traceInternals);

  return { type: 'new', session: newSession };
}
