import type { Event } from '@sentry/node';

/**
 * Removes the module name from each stack frame.
 *
 * We need to do this because for some reason, SvelteKit's stack traces include a module name
 * that can't be resolved by Sentry's stacktrace processing pipeline, leading to insufficient
 * grouping of errors.
 */
export function removeStackFrameModule(event: Event): Event {
  if (event.type) {
    // this is not an error event, so we don't care
    return event;
  }

  const exceptions = (event.exception && event.exception.values) || [];

  exceptions.forEach(exception => {
    if (!exception.stacktrace || !exception.stacktrace.frames) {
      return;
    }
    exception.stacktrace.frames = exception.stacktrace.frames.map(frame => {
      delete frame.module;
      return frame;
    });
  });

  return event;
}
