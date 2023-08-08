export type { Attachment } from './attachment.ts';
export type {
  Breadcrumb,
  BreadcrumbHint,
  FetchBreadcrumbData,
  XhrBreadcrumbData,
  FetchBreadcrumbHint,
  XhrBreadcrumbHint,
} from './breadcrumb.ts';
export type { Client } from './client.ts';
export type { ClientReport, Outcome, EventDropReason } from './clientreport.ts';
export type { Context, Contexts, DeviceContext, OsContext, AppContext, CultureContext, TraceContext } from './context.ts';
export type { DataCategory } from './datacategory.ts';
export type { DsnComponents, DsnLike, DsnProtocol } from './dsn.ts';
export type { DebugImage, DebugMeta } from './debugMeta.ts';
export type {
  AttachmentItem,
  BaseEnvelopeHeaders,
  BaseEnvelopeItemHeaders,
  ClientReportEnvelope,
  ClientReportItem,
  DynamicSamplingContext,
  Envelope,
  EnvelopeItemType,
  EnvelopeItem,
  EventEnvelope,
  EventEnvelopeHeaders,
  EventItem,
  ReplayEnvelope,
  SessionEnvelope,
  SessionItem,
  UserFeedbackItem,
  CheckInItem,
  CheckInEvelope,
} from './envelope.ts';
export type { ExtendedError } from './error.ts';
export type { Event, EventHint, EventType, ErrorEvent, TransactionEvent } from './event.ts';
export type { EventProcessor } from './eventprocessor.ts';
export type { Exception } from './exception.ts';
export type { Extra, Extras } from './extra.ts';
// This is a dummy export, purely for the purpose of loading `globals.ts`, in order to take advantage of its side effect
// of putting variables into the global namespace. See
// https://www.typescriptlang.org/docs/handbook/declaration-files/templates/global-modifying-module-d-ts.html.
export type {} from './globals.ts';
export type { Hub } from './hub.ts';
export type { Integration, IntegrationClass } from './integration.ts';
export type { Mechanism } from './mechanism.ts';
export type { ExtractedNodeRequestData, HttpHeaderValue, Primitive, WorkerLocation } from './misc.ts';
export type { ClientOptions, Options } from './options.ts';
export type { Package } from './package.ts';
export type { PolymorphicEvent, PolymorphicRequest } from './polymorphics.ts';
export type {
  ThreadId,
  FrameId,
  StackId,
  ThreadCpuSample,
  ThreadCpuStack,
  ThreadCpuFrame,
  ThreadCpuProfile,
  Profile,
} from './profiling.ts';
export type { ReplayEvent, ReplayRecordingData, ReplayRecordingMode } from './replay.ts';
export type { QueryParams, Request, SanitizedRequestData } from './request.ts';
export type { Runtime } from './runtime.ts';
export type { CaptureContext, Scope, ScopeContext } from './scope.ts';
export type { SdkInfo } from './sdkinfo.ts';
export type { SdkMetadata } from './sdkmetadata.ts';
export type {
  SessionAggregates,
  AggregationCounts,
  Session,
  SessionContext,
  SessionStatus,
  RequestSession,
  RequestSessionStatus,
  SessionFlusherLike,
  SerializedSession,
} from './session.ts';

// eslint-disable-next-line deprecation/deprecation
export type { Severity, SeverityLevel } from './severity.ts';
export type { Span, SpanContext } from './span.ts';
export type { StackFrame } from './stackframe.ts';
export type { Stacktrace, StackParser, StackLineParser, StackLineParserFn } from './stacktrace.ts';
export type { TextEncoderInternal } from './textencoder.ts';
export type { PropagationContext, TracePropagationTargets } from './tracing.ts';
export type {
  CustomSamplingContext,
  SamplingContext,
  TraceparentData,
  Transaction,
  TransactionContext,
  TransactionMetadata,
  TransactionSource,
} from './transaction.ts';
export type {
  DurationUnit,
  InformationUnit,
  FractionUnit,
  MeasurementUnit,
  NoneUnit,
  Measurements,
} from './measurement.ts';
export type { Thread } from './thread.ts';
export type {
  Transport,
  TransportRequest,
  TransportMakeRequestResponse,
  InternalBaseTransportOptions,
  BaseTransportOptions,
  TransportRequestExecutor,
} from './transport.ts';
export type { User, UserFeedback } from './user.ts';
export type { WrappedFunction } from './wrappedfunction.ts';
export type { Instrumenter } from './instrumenter.ts';
export type { HandlerDataFetch, HandlerDataXhr, SentryXhrData, SentryWrappedXMLHttpRequest } from './instrument.ts';

export type { BrowserClientReplayOptions, BrowserClientProfilingOptions } from './browseroptions.ts';
export type { CheckIn, MonitorConfig, SerializedCheckIn } from './checkin.ts';
