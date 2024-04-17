import {
  SEMANTIC_ATTRIBUTE_EXCLUSIVE_TIME,
  SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_UNIT,
  SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_VALUE,
  SentrySpan,
  createSpanEnvelope,
  getClient,
  getCurrentScope,
  sampleSpan,
  spanIsSampled,
} from '@sentry/core';
import type { SpanAttributes } from '@sentry/types';
import { browserPerformanceTimeOrigin, dropUndefinedKeys, htmlTreeAsString, logger } from '@sentry/utils';
import { DEBUG_BUILD } from '../../debug-build';
import { addInpInstrumentationHandler } from '../instrument';
import type { InteractionRouteNameMapping } from '../types';
import { getBrowserPerformanceAPI, msToSec } from './utils';

/**
 * Start tracking INP webvital events.
 */
export function startTrackingINP(interactionIdtoRouteNameMapping: InteractionRouteNameMapping): () => void {
  const performance = getBrowserPerformanceAPI();
  if (performance && browserPerformanceTimeOrigin) {
    const inpCallback = _trackINP(interactionIdtoRouteNameMapping);

    return (): void => {
      inpCallback();
    };
  }

  return () => undefined;
}

const INP_ENTRY_MAP: Record<string, 'click' | 'hover' | 'drag' | 'press'> = {
  click: 'click',
  pointerdown: 'click',
  pointerup: 'click',
  mousedown: 'click',
  mouseup: 'click',
  touchstart: 'click',
  touchend: 'click',
  mouseover: 'hover',
  mouseout: 'hover',
  mouseenter: 'hover',
  mouseleave: 'hover',
  pointerover: 'hover',
  pointerout: 'hover',
  pointerenter: 'hover',
  pointerleave: 'hover',
  dragstart: 'drag',
  dragend: 'drag',
  drag: 'drag',
  dragenter: 'drag',
  dragleave: 'drag',
  dragover: 'drag',
  drop: 'drag',
  keydown: 'press',
  keyup: 'press',
  keypress: 'press',
  input: 'press',
};

/** Starts tracking the Interaction to Next Paint on the current page. */
function _trackINP(interactionIdtoRouteNameMapping: InteractionRouteNameMapping): () => void {
  return addInpInstrumentationHandler(({ metric }) => {
    const client = getClient();
    if (!client || metric.value == undefined) {
      return;
    }

    const entry = metric.entries.find(entry => entry.duration === metric.value && INP_ENTRY_MAP[entry.name]);

    if (!entry) {
      return;
    }

    const interactionType = INP_ENTRY_MAP[entry.name];

    const options = client.getOptions();
    /** Build the INP span, create an envelope from the span, and then send the envelope */
    const startTime = msToSec((browserPerformanceTimeOrigin as number) + entry.startTime);
    const duration = msToSec(metric.value);
    const { routeName, activeSpan, user, replayId, currentScope } =
      entry.interactionId !== undefined
        ? interactionIdtoRouteNameMapping[entry.interactionId]
        : {
            routeName: undefined,
            currentScope: getCurrentScope(),
            activeSpan: undefined,
            user: undefined,
            replayId: undefined,
          };
    const userDisplay = user !== undefined ? user.email || user.id || user.ip_address : undefined;
    const profileId = currentScope.getScopeData().contexts?.profile?.profile_id as string | undefined;

    const name = htmlTreeAsString(entry.target);
    const parentSampled = activeSpan ? spanIsSampled(activeSpan) : undefined;
    const attributes: SpanAttributes = dropUndefinedKeys({
      release: options.release,
      environment: options.environment,
      transaction: routeName,
      [SEMANTIC_ATTRIBUTE_EXCLUSIVE_TIME]: metric.value,
      user: userDisplay || undefined,
      profile_id: profileId || undefined,
      replay_id: replayId || undefined,
    });

    /** Check to see if the span should be sampled */
    const [sampled, sampleRate] = sampleSpan(options, {
      name,
      parentSampled,
      attributes,
      transactionContext: {
        name,
        parentSampled,
      },
    });

    // Nothing to do
    if (!sampled) {
      return;
    }

    const span = new SentrySpan({
      startTimestamp: startTime,
      endTimestamp: startTime + duration,
      op: `ui.interaction.${interactionType}`,
      name,
      attributes,
    });

    span.addEvent('inp', {
      [SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_UNIT]: 'millisecond',
      [SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_VALUE]: metric.value,
    });

    if (Math.random() < (sampleRate as number | boolean)) {
      const envelope = span ? createSpanEnvelope([span]) : undefined;
      const transport = client && client.getTransport();
      if (transport && envelope) {
        transport.send(envelope).then(null, reason => {
          DEBUG_BUILD && logger.error('Error while sending interaction:', reason);
        });
      }
      return;
    }
  });
}
