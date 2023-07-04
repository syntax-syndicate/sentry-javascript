import { addGlobalEventProcessor, getCurrentHub } from '@sentry/core';
import type { Event, EventHint, Exception, ExtendedError, Integration, StackParser } from '@sentry/types';
import { isInstanceOf } from '@sentry/utils';

import type { BrowserClient } from '../client';
import { exceptionFromError } from '../eventbuilder';

const DEFAULT_KEY = 'cause';
const DEFAULT_LIMIT = 16;

interface LinkedErrorsOptions {
  key: string;
  limit: number;
}

/** Adds SDK info to an event. */
export class LinkedErrors implements Integration {
  /**
   * @inheritDoc
   */
  public static id: string = 'LinkedErrors';

  /**
   * @inheritDoc
   */
  public readonly name: string = LinkedErrors.id;

  /**
   * @inheritDoc
   */
  private readonly _key: LinkedErrorsOptions['key'];

  /**
   * @inheritDoc
   */
  private readonly _limit: LinkedErrorsOptions['limit'];

  /**
   * @inheritDoc
   */
  public constructor(options: Partial<LinkedErrorsOptions> = {}) {
    this._key = options.key || DEFAULT_KEY;
    this._limit = options.limit || DEFAULT_LIMIT;
  }

  /**
   * @inheritDoc
   */
  public setupOnce(): void {
    const client = getCurrentHub().getClient<BrowserClient>();
    if (!client) {
      return;
    }
    addGlobalEventProcessor((event: Event, hint?: EventHint) => {
      const self = getCurrentHub().getIntegration(LinkedErrors);
      return self ? _handler(client.getOptions().stackParser, self._key, self._limit, event, hint) : event;
    });
  }
}

/**
 * @inheritDoc
 */
export function _handler(
  parser: StackParser,
  key: string,
  limit: number,
  event: Event,
  hint?: EventHint,
): Event | null {
  if (!event.exception || !event.exception.values || !hint || !isInstanceOf(hint.originalException, Error)) {
    return event;
  }

  const originalException: Exception | undefined = event.exception.values.slice().reverse()[0];

  // We only create exception grouping if there is an exception in the event.
  if (originalException) {
    event.exception.values = _walkErrorTree(
      parser,
      limit,
      hint.originalException as ExtendedError,
      key,
      event.exception.values,
      originalException,
      0,
    );
  }

  return event;
}

/**
 * JSDOC
 */
export function _walkErrorTree(
  parser: StackParser,
  limit: number,
  error: ExtendedError,
  key: string,
  prevExceptions: Exception[],
  exception: Exception,
  exceptionId: number,
): Exception[] {
  if (prevExceptions.length + 1 >= limit) {
    return prevExceptions;
  }

  let newExceptions = [...prevExceptions];

  if (isInstanceOf(error[key], Error)) {
    applyExceptionGroupFieldsForParentException(exception, exceptionId);
    const newException = exceptionFromError(parser, error[key]);
    const newExceptionId = newExceptions.length;
    applyExceptionGroupFieldsForChildException(newException, key, newExceptionId, exceptionId);
    newExceptions = _walkErrorTree(
      parser,
      limit,
      error[key],
      key,
      [newException, ...newExceptions],
      newException,
      newExceptionId,
    );
  }

  // This will create exception grouping for AggregateErrors
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AggregateError
  if (Array.isArray(error.errors)) {
    error.errors.forEach((childError, i) => {
      if (isInstanceOf(childError, Error)) {
        applyExceptionGroupFieldsForParentException(exception, exceptionId);
        const newException = exceptionFromError(parser, childError);
        const newExceptionId = newExceptions.length;
        applyExceptionGroupFieldsForChildException(newException, `errors[${i}]`, newExceptionId, exceptionId);
        newExceptions = _walkErrorTree(
          parser,
          limit,
          childError,
          key,
          [newException, ...newExceptions],
          newException,
          newExceptionId,
        );
      }
    });
  }

  return newExceptions;
}

function applyExceptionGroupFieldsForParentException(exception: Exception, exceptionId: number): void {
  // Don't know if this default makes sense. The protocol requires us to set these values so we pick *some* default.
  exception.mechanism = exception.mechanism || { type: 'generic', handled: true };

  exception.mechanism = {
    ...exception.mechanism,
    type: 'chained',
    is_exception_group: true,
    exception_id: exceptionId,
  };
}

function applyExceptionGroupFieldsForChildException(
  exception: Exception,
  source: string,
  exceptionId: number,
  parentId: number | undefined,
): void {
  // Don't know if this default makes sense. The protocol requires us to set these values so we pick *some* default.
  exception.mechanism = exception.mechanism || { type: 'generic', handled: true };

  exception.mechanism = {
    ...exception.mechanism,
    type: 'chained',
    source,
    exception_id: exceptionId,
    parent_id: parentId,
  };
}
