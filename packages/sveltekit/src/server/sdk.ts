<<<<<<< Updated upstream
import { configureScope } from '@sentry/core';
=======
import { addGlobalEventProcessor, configureScope } from '@sentry/core';
import { RewriteFrames } from '@sentry/integrations';
>>>>>>> Stashed changes
import type { NodeOptions } from '@sentry/node';
import { init as initNodeSdk, Integrations } from '@sentry/node';
import { addOrUpdateIntegration } from '@sentry/utils';

import { applySdkMetadata } from '../common/metadata';
import { removeStackFrameModule } from './stacktrace';

/**
 * Initialize the server side of the Sentry SvelteKit SDK.
 *
 * @param options Configuration options for the SDK.
 */
export function init(options: NodeOptions): void {
  applySdkMetadata(options, ['sveltekit', 'node']);

  addServerIntegrations(options);

  initNodeSdk(options);

  configureScope(scope => {
    scope.setTag('runtime', 'node');
  });

  addGlobalEventProcessor(removeStackFrameModule);
}

function addServerIntegrations(options: NodeOptions): void {
  options.integrations = addOrUpdateIntegration(new Integrations.Undici(), options.integrations || []);
}
