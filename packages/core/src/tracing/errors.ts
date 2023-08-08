import { addInstrumentationHandler, logger } from '@sentry/utils';

import type { SpanStatusType } from './span.ts';
import { getActiveTransaction } from './utils.ts';

let errorsInstrumented = false;

/**
 * Configures global error listeners
 */
export function registerErrorInstrumentation(): void {
  if (errorsInstrumented) {
    return;
  }

  errorsInstrumented = true;
  addInstrumentationHandler('error', errorCallback);
  addInstrumentationHandler('unhandledrejection', errorCallback);
}

/**
 * If an error or unhandled promise occurs, we mark the active transaction as failed
 */
function errorCallback(): void {
  const activeTransaction = getActiveTransaction();
  if (activeTransaction) {
    const status: SpanStatusType = 'internal_error';
    typeof __DEBUG_BUILD__ !== 'undefined' && __DEBUG_BUILD__ && logger.log(`[Tracing] Transaction: ${status} -> Global error occured`);
    activeTransaction.setStatus(status);
  }
}

// The function name will be lost when bundling but we need to be able to identify this listener later to maintain the
// node.js default exit behaviour
errorCallback.tag = 'sentry_tracingErrorCallback';
