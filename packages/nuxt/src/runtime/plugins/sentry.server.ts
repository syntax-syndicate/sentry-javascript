import * as Sentry from '@sentry/node';
import { H3Error, getRequestURL, getRouterParams, getQuery } from 'h3';
import { defineNitroPlugin } from 'nitropack/runtime';
import type { NuxtRenderHTMLContext } from 'nuxt/app';
import { addSentryTracingMetaTags, extractErrorContext } from '../utils';

export default defineNitroPlugin(nitroApp => {
  const index = nitroApp.h3App.stack.findIndex(layer => layer.handler.__resolve__);
  const router = nitroApp.h3App.stack[index];

  if (router) {
    nitroApp.h3App.stack.splice(index, 1, {
      ...router,
      handler: async event => {
        const url = getRequestURL(event);
        const params = getRouterParams(event);
        const query = getQuery(event);
        console.log('***** request hook for url', url);
        console.log({ params });
        console.log({ query})
        console.log({ event });
        console.log(event.context._nitro)
        console.log(event.context._nitro)
        return router?.handler(event);
      },
    });
  }

  nitroApp.hooks.hook('error', (error, errorContext) => {
    // Do not handle 404 and 422
    if (error instanceof H3Error) {
      // Do not report if status code is 3xx or 4xx
      if (error.statusCode >= 300 && error.statusCode < 500) {
        return;
      }
    }

    const { method, path } = {
      method: errorContext.event && errorContext.event._method ? errorContext.event._method : '',
      path: errorContext.event && errorContext.event._path ? errorContext.event._path : null,
    };

    if (path) {
      Sentry.getCurrentScope().setTransactionName(`${method} ${path}`);
    }

    const structuredContext = extractErrorContext(errorContext);

    Sentry.captureException(error, {
      captureContext: { contexts: { nuxt: structuredContext } },
      mechanism: { handled: false },
    });
  });

  // @ts-expect-error - 'render:html' is a valid hook name in the Nuxt context
  nitroApp.hooks.hook('render:html', (html: NuxtRenderHTMLContext) => {
    addSentryTracingMetaTags(html.head);
  });

  nitroApp.hooks.hook('request', event => {
    const url = getRequestURL(event);
    const params = getRouterParams(event);
    console.log('----- request hook for url', url);
    console.log({ params });
    console.log({ event });
  });
});
