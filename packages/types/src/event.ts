import type { Attachment } from './attachment.ts';
import type { Breadcrumb } from './breadcrumb.ts';
import type { Contexts } from './context.ts';
import type { DebugMeta } from './debugMeta.ts';
import type { Exception } from './exception.ts';
import type { Extras } from './extra.ts';
import type { Measurements } from './measurement.ts';
import type { Primitive } from './misc.ts';
import type { Request } from './request.ts';
import type { CaptureContext } from './scope.ts';
import type { SdkInfo } from './sdkinfo.ts';
import type { Severity, SeverityLevel } from './severity.ts';
import type { Span } from './span.ts';
import type { Thread } from './thread.ts';
import type { TransactionSource } from './transaction.ts';
import type { User } from './user.ts';

/** JSDoc */
export interface Event {
  event_id?: string;
  message?: string;
  timestamp?: number;
  start_timestamp?: number;
  // eslint-disable-next-line deprecation/deprecation
  level?: Severity | SeverityLevel;
  platform?: string;
  logger?: string;
  server_name?: string;
  release?: string;
  dist?: string;
  environment?: string;
  sdk?: SdkInfo;
  request?: Request;
  transaction?: string;
  modules?: { [key: string]: string };
  fingerprint?: string[];
  exception?: {
    values?: Exception[];
  };
  breadcrumbs?: Breadcrumb[];
  contexts?: Contexts;
  tags?: { [key: string]: Primitive };
  extra?: Extras;
  user?: User;
  type?: EventType;
  spans?: Span[];
  measurements?: Measurements;
  debug_meta?: DebugMeta;
  // A place to stash data which is needed at some point in the SDK's event processing pipeline but which shouldn't get sent to Sentry
  sdkProcessingMetadata?: { [key: string]: any };
  transaction_info?: {
    source: TransactionSource;
  };
  threads?: {
    values: Thread[];
  };
}

/**
 * The type of an `Event`.
 * Note that `ErrorEvent`s do not have a type (hence its undefined),
 * while all other events are required to have one.
 */
export type EventType = 'transaction' | 'profile' | 'replay_event' | undefined;

export interface ErrorEvent extends Event {
  type: undefined;
}
export interface TransactionEvent extends Event {
  type: 'transaction';
}

/** JSDoc */
export interface EventHint {
  event_id?: string;
  captureContext?: CaptureContext;
  syntheticException?: Error | null;
  originalException?: unknown;
  attachments?: Attachment[];
  data?: any;
  integrations?: string[];
}
