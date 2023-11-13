// @ts-expect-error See above
// eslint-disable-next-line import/no-unresolved
import * as wrapee from '__SENTRY_WRAPPING_TARGET_FILE__';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as Sentry from '@sentry/nextjs';
import type { NextPage as NextPageComponent } from 'next';

type NextPageModule = {
  default?: { getInitialProps?: NextPageComponent['getInitialProps'] };
};

const userPageModule = wrapee as NextPageModule;

const pageComponent = userPageModule ? userPageModule.default : undefined;

// const origGetInitialProps = pageComponent ? pageComponent.getInitialProps : undefined;

// if (pageComponent && typeof origGetInitialProps === 'function') {
//   pageComponent.getInitialProps = Sentry.wrapClientGetInitialPropsWithSentry(
//     origGetInitialProps,
//   ) as NextPageComponent['getInitialProps'];
// }

console.log({
  page: '__ROUTE__',
  // @ts-ignore
  wrapped: pageComponent && '__ROUTE__' !== '/_app' && '__ROUTE__' !== '/_error' && '__ROUTE__' !== '/_document',
});

// @ts-ignore
export default pageComponent && '__ROUTE__' !== '/_app' && '__ROUTE__' !== '/_error' && '__ROUTE__' !== '/_document'
  ? Sentry.wrapClientPageComponentWithSentry(pageComponent as any)
  : pageComponent;

// Re-export anything exported by the page module we're wrapping. When processing this code, Rollup is smart enough to
// not include anything whose name matchs something we've explicitly exported above.
// @ts-expect-error See above
// eslint-disable-next-line import/no-unresolved
export * from '__SENTRY_WRAPPING_TARGET_FILE__';
