import {
  functionToStringIntegration,
  getIntegrationsToSetup,
  inboundFiltersIntegration,
  initAndBind,
  linkedErrorsIntegration,
  requestDataIntegration,
} from '@sentry/core';
import type { Integration, Options } from '@sentry/types';
import { GLOBAL_OBJ, createStackParser, nodeStackLineParser, stackParserFromStackParserOptions } from '@sentry/utils';

import { VercelEdgeClient } from './client';
import { winterCGFetchIntegration } from './integrations/wintercg-fetch';
import { makeEdgeTransport } from './transports';
import type { VercelEdgeClientOptions, VercelEdgeOptions } from './types';
import { getVercelEnv } from './utils/vercel';

import { setOpenTelemetryContextAsyncContextStrategy } from '@sentry/opentelemetry';
import { registerOTel } from '@vercel/otel';

declare const process: {
  env: Record<string, string>;
};

const nodeStackParser = createStackParser(nodeStackLineParser());

/** Get the default integrations for the browser SDK. */
export function getDefaultIntegrations(options: Options): Integration[] {
  return [
    inboundFiltersIntegration(),
    functionToStringIntegration(),
    linkedErrorsIntegration(),
    winterCGFetchIntegration(),
    ...(options.sendDefaultPii ? [requestDataIntegration()] : []),
  ];
}

/** Inits the Sentry NextJS SDK on the Edge Runtime. */
export function init(options: VercelEdgeOptions = {}): void {
  setOpenTelemetryContextAsyncContextStrategy();

  if (options.defaultIntegrations === undefined) {
    options.defaultIntegrations = getDefaultIntegrations(options);
  }

  if (options.dsn === undefined && process.env.SENTRY_DSN) {
    options.dsn = process.env.SENTRY_DSN;
  }

  if (options.tracesSampleRate === undefined && process.env.SENTRY_TRACES_SAMPLE_RATE) {
    const tracesSampleRate = parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE);
    if (isFinite(tracesSampleRate)) {
      options.tracesSampleRate = tracesSampleRate;
    }
  }

  if (options.release === undefined) {
    const detectedRelease = getSentryRelease();
    if (detectedRelease !== undefined) {
      options.release = detectedRelease;
    } else {
      // If release is not provided, then we should disable autoSessionTracking
      options.autoSessionTracking = false;
    }
  }

  options.environment =
    options.environment || process.env.SENTRY_ENVIRONMENT || getVercelEnv(false) || process.env.NODE_ENV;

  if (options.autoSessionTracking === undefined && options.dsn !== undefined) {
    options.autoSessionTracking = true;
  }

  const clientOptions: VercelEdgeClientOptions = {
    ...options,
    stackParser: stackParserFromStackParserOptions(options.stackParser || nodeStackParser),
    integrations: getIntegrationsToSetup(options),
    transport: options.transport || makeEdgeTransport,
  };

  initAndBind(VercelEdgeClient, clientOptions);

  // OTEL

  // if (client.getOptions().debug) {
  //   const otelLogger = new Proxy(logger as typeof logger & { verbose: (typeof logger)['debug'] }, {
  //     get(target, prop, receiver) {
  //       const actualProp = prop === 'verbose' ? 'debug' : prop;
  //       return Reflect.get(target, actualProp, receiver);
  //     },
  //   });

  //   diag.setLogger(otelLogger, DiagLogLevel.DEBUG);
  // }

  // const provider = setupOtel(client);
  // client.traceProvider = provider;

  registerOTel({
    // traceSampler: new SentrySampler(),
    // attributes: {
    //   [SemanticResourceAttributes.SERVICE_NAME]: 'node',
    //   [SemanticResourceAttributes.SERVICE_NAMESPACE]: 'sentry',
    //   [SemanticResourceAttributes.SERVICE_VERSION]: SDK_VERSION,
    // },
    // propagators: [],
    // spanProcessors: [],
    // contextManager: null,
    serviceName: 'luca-service',
    spanProcessors: [
      {
        async forceFlush() {
          //
        },
        async shutdown() {
          //
        },
        onStart(span) {
          console.log('luca-otel-start', span.name);
        },
        onEnd(span) {
          console.log('luca-otel-end', span.name);
        },
      },
    ],
  });
}

/**
 * Returns a release dynamically from environment variables.
 */
export function getSentryRelease(fallback?: string): string | undefined {
  // Always read first as Sentry takes this as precedence
  if (process.env.SENTRY_RELEASE) {
    return process.env.SENTRY_RELEASE;
  }

  // This supports the variable that sentry-webpack-plugin injects
  if (GLOBAL_OBJ.SENTRY_RELEASE && GLOBAL_OBJ.SENTRY_RELEASE.id) {
    return GLOBAL_OBJ.SENTRY_RELEASE.id;
  }

  return (
    // GitHub Actions - https://help.github.com/en/actions/configuring-and-managing-workflows/using-environment-variables#default-environment-variables
    process.env.GITHUB_SHA ||
    // Vercel - https://vercel.com/docs/v2/build-step#system-environment-variables
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.VERCEL_GITHUB_COMMIT_SHA ||
    process.env.VERCEL_GITLAB_COMMIT_SHA ||
    process.env.VERCEL_BITBUCKET_COMMIT_SHA ||
    // Zeit (now known as Vercel)
    process.env.ZEIT_GITHUB_COMMIT_SHA ||
    process.env.ZEIT_GITLAB_COMMIT_SHA ||
    process.env.ZEIT_BITBUCKET_COMMIT_SHA ||
    fallback
  );
}
