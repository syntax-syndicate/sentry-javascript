import { getCurrentHub } from '@sentry/core';
import { logger } from '@sentry/utils';

import type { NodeClient } from '../../client.ts';

const DEFAULT_SHUTDOWN_TIMEOUT = 2000;

/**
 * @hidden
 */
export function logAndExitProcess(error: Error): void {
  // eslint-disable-next-line no-console
  console.error(error && error.stack ? error.stack : error);

  const client = getCurrentHub().getClient<NodeClient>();

  if (client === undefined) {
    typeof __DEBUG_BUILD__ !== 'undefined' && __DEBUG_BUILD__ && logger.warn('No NodeClient was defined, we are exiting the process now.');
    global.process.exit(1);
  }

  const options = client.getOptions();
  const timeout =
    (options && options.shutdownTimeout && options.shutdownTimeout > 0 && options.shutdownTimeout) ||
    DEFAULT_SHUTDOWN_TIMEOUT;
  client.close(timeout).then(
    (result: boolean) => {
      if (!result) {
        typeof __DEBUG_BUILD__ !== 'undefined' && __DEBUG_BUILD__ && logger.warn('We reached the timeout for emptying the request buffer, still exiting now!');
      }
      global.process.exit(1);
    },
    error => {
      typeof __DEBUG_BUILD__ !== 'undefined' && __DEBUG_BUILD__ && logger.error(error);
    },
  );
}
