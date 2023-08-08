/* eslint-disable import/export */
import { configureScope, init as reactInit } from '@sentry/react';

import { buildMetadata } from './utils/metadata.ts';
import type { RemixOptions } from './utils/remixOptions.ts';
export { remixRouterInstrumentation, withSentry } from './client/performance.ts';
export { captureRemixErrorBoundaryError } from './client/errors.ts';
export * from '@sentry/react';

export function init(options: RemixOptions): void {
  buildMetadata(options, ['remix', 'react']);
  options.environment = options.environment || process.env.NODE_ENV;

  reactInit(options);

  configureScope(scope => {
    scope.setTag('runtime', 'browser');
  });
}
