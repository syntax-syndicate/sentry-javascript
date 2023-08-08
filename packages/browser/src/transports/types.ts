import type { BaseTransportOptions } from '@sentry/types';

import type { BrowserOfflineTransportOptions } from './offline.ts';

type BaseTransportAndOfflineTransportOptions = BaseTransportOptions & BrowserOfflineTransportOptions;

export interface BrowserTransportOptions extends BaseTransportAndOfflineTransportOptions {
  /** Fetch API init parameters. Used by the FetchTransport */
  fetchOptions?: RequestInit;
  /** Custom headers for the transport. Used by the XHRTransport and FetchTransport */
  headers?: { [key: string]: string };
}
