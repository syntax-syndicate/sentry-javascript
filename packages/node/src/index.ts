export type {
  Breadcrumb,
  BreadcrumbHint,
  PolymorphicRequest,
  Request,
  SdkInfo,
  Event,
  EventHint,
  Exception,
  Session,
  // eslint-disable-next-line deprecation/deprecation
  Severity,
  SeverityLevel,
  Span,
  StackFrame,
  Stacktrace,
  Thread,
  Transaction,
  User,
} from '@sentry/types';
export type { AddRequestDataToEventOptions } from '@sentry/utils';

export type { TransactionNamingScheme } from './requestdata.ts';
export type { NodeOptions } from './types.ts';

export {
  addGlobalEventProcessor,
  addBreadcrumb,
  captureException,
  captureEvent,
  captureMessage,
  configureScope,
  createTransport,
  extractTraceparentData,
  getActiveTransaction,
  getHubFromCarrier,
  getCurrentHub,
  Hub,
  makeMain,
  runWithAsyncContext,
  Scope,
  startTransaction,
  SDK_VERSION,
  setContext,
  setExtra,
  setExtras,
  setTag,
  setTags,
  setUser,
  spanStatusfromHttpCode,
  trace,
  withScope,
  captureCheckIn,
} from '@sentry/core';
export type { SpanStatusType } from '@sentry/core';
export { autoDiscoverNodePerformanceMonitoringIntegrations } from './tracing.ts';

export { NodeClient } from './client.ts';
export { makeNodeTransport } from './transports.ts';
export { defaultIntegrations, init, defaultStackParser, lastEventId, flush, close, getSentryRelease } from './sdk.ts';
export { addRequestDataToEvent, DEFAULT_USER_INCLUDES, extractRequestData } from './requestdata.ts';
export { deepReadDirSync } from './utils.ts';
export { getModuleFromFilename } from './module.ts';

import { Integrations as CoreIntegrations } from '@sentry/core';

import * as Handlers from './handlers.ts';
import * as NodeIntegrations from './integrations.ts';
import * as TracingIntegrations from './tracing/integrations.ts';

const INTEGRATIONS = {
  ...CoreIntegrations,
  ...NodeIntegrations,
  ...TracingIntegrations,
};

export { INTEGRATIONS as Integrations, Handlers };
