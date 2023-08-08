import * as Sentry from '@sentry/node';
import type { Integration } from '@sentry/types';

import { GoogleCloudGrpc } from '../google-cloud-grpc.ts';
import { GoogleCloudHttp } from '../google-cloud-http.ts';
import { serverlessEventProcessor } from '../utils.ts';

export * from './http.ts';
export * from './events.ts';
export * from './cloud_events.ts';

export const defaultIntegrations: Integration[] = [
  ...Sentry.defaultIntegrations,
  new GoogleCloudHttp({ optional: true }), // We mark this integration optional since '@google-cloud/common' module could be missing.
  new GoogleCloudGrpc({ optional: true }), // We mark this integration optional since 'google-gax' module could be missing.
];

/**
 * @see {@link Sentry.init}
 */
export function init(options: Sentry.NodeOptions = {}): void {
  if (options.defaultIntegrations === undefined) {
    options.defaultIntegrations = defaultIntegrations;
  }

  options._metadata = options._metadata || {};
  options._metadata.sdk = {
    name: 'sentry.javascript.serverless',
    integrations: ['GCPFunction'],
    packages: [
      {
        name: 'npm:@sentry/serverless',
        version: Sentry.SDK_VERSION,
      },
    ],
    version: Sentry.SDK_VERSION,
  };

  Sentry.init(options);
  Sentry.addGlobalEventProcessor(serverlessEventProcessor);
}
