import { captureException } from '@sentry/core';
import { addExceptionMechanism, addNonEnumerableProperty } from '@sentry/utils';

interface FunctionComponent {
  (...args: unknown[]): unknown;
}

interface ClassComponent {
  new (...args: unknown[]): {
    props?: unknown;
    render(...args: unknown[]): unknown;
  };
}

function isReactClassComponent(target: unknown): target is ClassComponent {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return typeof target === 'function' && target?.prototype?.isReactComponent;
}

/**
 * Wraps a client page component with Sentry error instrumentation.
 */
export function wrapClientPageComponentWithSentry(pageComponent: FunctionComponent | ClassComponent): unknown {
  function captureError(e: unknown): void {
    if (e !== null && e !== undefined) {
      if ((e as { _sentrySeen?: boolean })._sentrySeen) {
        return;
      }

      addNonEnumerableProperty(e, '_sentrySeen', 1);
    }

    captureException(e, scope => {
      scope.setTag('fuck', 'fuck');
      scope.addEventProcessor(event => {
        addExceptionMechanism(event, {
          handled: false,
          data: {
            wrapClient: true,
          },
        });
        return event;
      });

      return scope;
    });
  }

  if (isReactClassComponent(pageComponent)) {
    return class SentryWrappedPageComponent extends pageComponent {
      public render(...args: unknown[]): unknown {
        try {
          return super.render(...args);
        } catch (e) {
          captureError(e);
          throw e;
        }
      }
    };
  } else if (typeof pageComponent === 'function') {
    return new Proxy(pageComponent, {
      apply(target, thisArg, argArray) {
        try {
          return target.apply(thisArg, argArray);
        } catch (e) {
          captureError(e);
          throw e;
        }
      },
    });
  } else {
    return pageComponent;
  }
}
