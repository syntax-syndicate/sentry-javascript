import {
  SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN,
  SEMANTIC_ATTRIBUTE_SENTRY_SOURCE,
  SPAN_STATUS_ERROR,
  captureException,
  handleCallbackErrors,
  startSpan,
} from '@sentry/core';
import type { Span } from '@sentry/types';
import type { NitroApp } from 'nitropack';
import { defineNitroPlugin } from 'nitropack/runtime';
import { flushIfServerless, isRedirect } from '../server/utils';

export default defineNitroPlugin((nitroApp: NitroApp) => {
  nitroApp.hooks.hook('beforeResponse', event => {
    const path = event.context.solidFetchEvent.router.matches[0].path;
    const span = event.context.__sentry_span__ as Span;

    if (span && path) {
      span.updateName(`${event.method} ${path}`);
      span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_SOURCE, 'route');
    }
  });

  nitroApp.h3App.handler = new Proxy(nitroApp.h3App.handler, {
    async apply(handlerTarget, handlerThisArg, handlerArgs: Parameters<typeof nitroApp.h3App.handler>) {
      const [event] = handlerArgs;

      try {
        return await startSpan(
          {
            op: 'http.server',
            name: `${event.method} ${event.path}`,
            attributes: {
              [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: 'auto.http.nitro',
              [SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: 'url',
              'http.method': event.method,
            },
          },
          async span => {
            // Store the span on the context, so we can later
            // update its name and source when the parametrized
            // route details come in.
            event.context.__sentry_span__ = span;

            const result = await handleCallbackErrors(
              () => handlerTarget.apply(handlerThisArg, handlerArgs),
              error => {
                if (!isRedirect(error)) {
                  span.setStatus({ code: SPAN_STATUS_ERROR, message: 'internal_error' });
                  captureException(error, {
                    mechanism: {
                      handled: false,
                      type: 'nitro',
                    },
                  });
                }
              },
            );

            return result;
          },
        );
      } finally {
        await flushIfServerless();
      }
    },
  });
});
