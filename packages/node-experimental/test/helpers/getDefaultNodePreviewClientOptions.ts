import { createTransport } from '@sentry/core';
import { resolvedSyncPromise } from '@sentry/utils';

import type { NodeExperimentalClientOptions } from '../../src/types.ts';

export function getDefaultNodeExperimentalClientOptions(
  options: Partial<NodeExperimentalClientOptions> = {},
): NodeExperimentalClientOptions {
  return {
    integrations: [],
    transport: () => createTransport({ recordDroppedEvent: () => undefined }, _ => resolvedSyncPromise({})),
    stackParser: () => [],
    ...options,
  };
}
