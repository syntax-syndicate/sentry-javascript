export type {
  ComponentTrackingInitOptions as ComponentTrackingOptions,
  TrackComponentOptions as TrackingOptions,
} from './types.ts';

export * from '@sentry/browser';

export { init } from './sdk.ts';

// TODO(v8): Remove this export
// eslint-disable-next-line deprecation/deprecation
export { componentTrackingPreprocessor } from './preprocessors.ts';

export { trackComponent } from './performance.ts';

export { withSentryConfig } from './config.ts';
