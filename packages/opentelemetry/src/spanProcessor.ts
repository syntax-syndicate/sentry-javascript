import type { Context } from '@opentelemetry/api';
import { ROOT_CONTEXT, trace } from '@opentelemetry/api';
import type { Span, SpanProcessor as SpanProcessorInterface } from '@opentelemetry/sdk-trace-base';
import { addChildSpanToSpan, getClient, getDefaultCurrentScope, getDefaultIsolationScope } from '@sentry/core';
import { logger } from '@sentry/utils';

import { DEBUG_BUILD } from './debug-build';
import { SEMANTIC_ATTRIBUTE_SENTRY_PARENT_IS_REMOTE } from './semanticAttributes';
import { getScopesFromContext } from './utils/contextData';
import { setIsSetup } from './utils/setupCheck';
import { setSpanScopes } from './utils/spanData';

function onSpanStart(span: Span, parentContext: Context): void {
  // This is a reliable way to get the parent span - because this is exactly how the parent is identified in the OTEL SDK
  const parentSpan = trace.getSpan(parentContext);

  let scopes = getScopesFromContext(parentContext);

  // We need access to the parent span in order to be able to move up the span tree for breadcrumbs
  if (parentSpan && !parentSpan.spanContext().isRemote) {
    addChildSpanToSpan(parentSpan, span);
  }

  // We need this in the span exporter
  if (parentSpan && parentSpan.spanContext().isRemote) {
    span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_PARENT_IS_REMOTE, true);
  }

  // The root context does not have scopes stored, so we check for this specifically
  // As fallback we attach the global scopes
  if (parentContext === ROOT_CONTEXT) {
    scopes = {
      scope: getDefaultCurrentScope(),
      isolationScope: getDefaultIsolationScope(),
    };
  }

  // We need the scope at time of span creation in order to apply it to the event when the span is finished
  if (scopes) {
    setSpanScopes(span, scopes);
  }

  const client = getClient();
  client?.emit('spanStart', span);
}

function onSpanEnd(span: Span): void {
  const client = getClient();
  client?.emit('spanEnd', span);
}

/**
 * Converts OpenTelemetry Spans to Sentry Spans and sends them to Sentry via
 * the Sentry SDK.
 */
export class SentrySpanProcessor implements SpanProcessorInterface {
  private _isShutDown: boolean;

  public constructor() {
    this._isShutDown = false;
    setIsSetup('SentrySpanProcessor');
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  public onStart(span: Span, parentContext: Context): void {
    onSpanStart(span, parentContext);

    // TODO (v8): Trigger client `spanStart` & `spanEnd` in here,
    // once we decoupled opentelemetry from SentrySpan

    DEBUG_BUILD && logger.log(`[Tracing] Starting span "${span.name}" (${span.spanContext().spanId})`);
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  public onEnd(span: Span): void {
    if (this._isShutDown) {
      DEBUG_BUILD &&
        logger.log(
          `[Tracing] Will not finish and record span "${span.name}" because processor is shut down (${
            span.spanContext().spanId
          })`,
        );
      return;
    }

    if (!this._shouldSendSpanToSentry(span)) {
      DEBUG_BUILD &&
        logger.log(
          `[Tracing] Will not finish and record span "${
            span.name
          }" because _shouldSendSpanToSentry() returned falsy value (${span.spanContext().spanId})`,
        );
      return;
    }

    DEBUG_BUILD && logger.log(`[Tracing] Finishing span "${span.name}" (${span.spanContext().spanId})`);

    onSpanEnd(span);
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  public async forceFlush(): Promise<void> {
    const client = getClient();
    await client?.flush().then(null, () => {
      // client.flush() can throw but we shouldn't surface it so we noop here.
    });
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  public async shutdown(): Promise<void> {
    this._isShutDown = true;
    await this.forceFlush();
  }

  /**
   * You can overwrite this in a sub class to implement custom behavior for dropping spans.
   * If you return `false` here, the span will not be passed to the exporter and thus not be sent.
   */
  protected _shouldSendSpanToSentry(_span: Span): boolean {
    return true;
  }
}

function isRootSpan(span: Span, parentContext: Context): boolean {
  const parentSpan = trace.getSpan(parentContext);
}
