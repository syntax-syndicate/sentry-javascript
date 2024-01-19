'use client';

// @ts-expect-error TODO
// biome-ignore lint/nursery/noUnusedImports: <explanation>
import * as nextNavigation from 'next/navigation';
import * as React from 'react';

declare const nextNavigation: {
  useServerInsertedHTML?: (callback: () => React.ReactNode) => void;
};

let hasBeenInserted = false;

/**
 * TODO
 */
export function experimental_nextjsSSRTracing({
  baggage,
  sentryTrace,
  suggestedPageloadSpanId,
}: { baggage: string | undefined; sentryTrace: string; suggestedPageloadSpanId: string }): null {
  try {
    nextNavigation.useServerInsertedHTML?.(() => {
      if (hasBeenInserted) {
        return;
      }

      hasBeenInserted = true;

      return React.createElement(
        React.Fragment,
        null,
        React.createElement('meta', { name: 'sentry-trace', content: sentryTrace }),
        React.createElement('meta', { name: 'sentry-suggested-pageload-span-id', content: suggestedPageloadSpanId }),
        baggage ? React.createElement('meta', { name: 'baggage', content: baggage }) : null,
      );
    });
  } catch (e) {
    console.log('woot', e);
  }

  return null;
}
