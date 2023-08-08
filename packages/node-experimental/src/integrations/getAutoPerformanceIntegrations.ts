import type { Integration } from '@sentry/types';

import { Express } from './express.ts';
import { Fastify } from './fastify.ts';
import { GraphQL } from './graphql.ts';
import { Mongo } from './mongo.ts';
import { Mongoose } from './mongoose.ts';
import { Mysql } from './mysql.ts';
import { Mysql2 } from './mysql2.ts';
import { Nest } from './nest.ts';
import type { NodePerformanceIntegration } from './NodePerformanceIntegration.ts';
import { Postgres } from './postgres.ts';
import { Prisma } from './prisma.ts';

const INTEGRATIONS: (() => NodePerformanceIntegration<unknown>)[] = [
  () => {
    return new Express();
  },
  () => {
    return new Fastify();
  },
  () => {
    return new GraphQL();
  },
  () => {
    return new Mongo();
  },
  () => {
    return new Mongoose();
  },
  () => {
    return new Mysql();
  },
  () => {
    return new Mysql2();
  },
  () => {
    return new Postgres();
  },
  () => {
    return new Prisma();
  },
  () => {
    return new Nest();
  },
];

/**
 * Get auto-dsicovered performance integrations.
 * Note that due to the way OpenTelemetry instrumentation works, this will generally still return Integrations
 * for stuff that may not be installed. This is because Otel only instruments when the module is imported/required,
 * so if the package is not required at all it will not be patched, and thus not instrumented.
 * But the _Sentry_ Integration will still be added.
 * This _may_ be a bit confusing because it shows all integrations as being installed in the debug logs, but this is
 * technically not wrong because we install it (it just doesn't do anything).
 */
export function getAutoPerformanceIntegrations(): Integration[] {
  const loadedIntegrations = INTEGRATIONS.map(tryLoad => {
    try {
      const integration = tryLoad();
      const isLoaded = integration.loadInstrumentations();
      return isLoaded ? integration : false;
    } catch (_) {
      return false;
    }
  }).filter(integration => !!integration) as Integration[];

  return loadedIntegrations;
}
