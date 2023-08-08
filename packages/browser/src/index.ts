export * from './exports.ts';

import { Integrations as CoreIntegrations } from '@sentry/core';

import { WINDOW } from './helpers.ts';
import * as BrowserIntegrations from './integrations.ts';

let windowIntegrations = {};

// This block is needed to add compatibility with the integrations packages when used with a CDN
if (WINDOW.Sentry && WINDOW.Sentry.Integrations) {
  windowIntegrations = WINDOW.Sentry.Integrations;
}

const INTEGRATIONS = {
  ...windowIntegrations,
  ...CoreIntegrations,
  ...BrowserIntegrations,
};

export { INTEGRATIONS as Integrations };

export { Replay } from '@sentry/replay';
export {
  BrowserTracing,
  defaultRequestInstrumentationOptions,
  instrumentOutgoingRequests,
} from '@sentry-internal/tracing';
export type { RequestInstrumentationOptions } from '@sentry-internal/tracing';
export {
  addTracingExtensions,
  extractTraceparentData,
  getActiveTransaction,
  spanStatusfromHttpCode,
  trace,
  makeMultiplexedTransport,
  ModuleMetadata,
} from '@sentry/core';
export type { SpanStatusType } from '@sentry/core';
export type { Span } from '@sentry/types';
export { makeBrowserOfflineTransport } from './transports/offline.ts';
export { onProfilingStartRouteTransaction } from './profiling/hubextensions.ts';
export { BrowserProfilingIntegration } from './profiling/integration.ts';
