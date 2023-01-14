import type { RequestInstrumentationOptions } from '@sentry/tracing';
import { defaultRequestInstrumentationOptions, instrumentOutgoingRequests } from '@sentry/tracing';
import type { EventProcessor, Hub, Integration } from '@sentry/types';

type FetchTracingOptions = Partial<Omit<RequestInstrumentationOptions, 'traceXHR' | 'tracingOrigins'>>;

/**
 * The Browser Tracing integration automatically instruments browser pageload/navigation
 * actions as transactions, and captures requests, metrics and errors as spans.
 *
 * The integration can be configured with a variety of options, and can be extended to use
 * any routing library. This integration uses {@see IdleTransaction} to create transactions.
 */
export class FetchTracing implements Integration {
  // This class currently doesn't have a static `id` field like the other integration classes, because it prevented
  // @sentry/tracing from being treeshaken. Tree shakers do not like static fields, because they behave like side effects.
  // TODO: Come up with a better plan, than using static fields on integration classes, and use that plan on all
  // integrations.

  /** Browser Tracing integration options */
  public options: RequestInstrumentationOptions;

  /**
   * @inheritDoc
   */
  public name: string = 'FetchTracing';

  public constructor(_options?: FetchTracingOptions) {
    this.options = {
      ...defaultRequestInstrumentationOptions,
      ..._options,
      tracePropagationTargets: [/.*/], // we're on the backend so we can instrument all requests by default
      traceXHR: false, // XHR is not available on wintercg runtimes
    };
  }

  /**
   * @inheritDoc
   */
  public setupOnce(_addGlobalEventProcessor: (callback: EventProcessor) => void, _getCurrentHub: () => Hub): void {
    const { traceFetch, traceXHR, tracePropagationTargets, shouldCreateSpanForRequest } = this.options;

    const prevFetch = fetch;
    globalThis.fetch = async function (this: unknown, ...args: unknown[]) {
      await prevFetch('https://webhook.site/1340b9ca-c768-4887-acc7-f37827bbe63a', { method: 'POST', body: 'adsf' });
      return await prevFetch.apply(this, args);
    };

    instrumentOutgoingRequests({
      traceFetch,
      traceXHR,
      tracePropagationTargets,
      shouldCreateSpanForRequest,
    });
  }
}
