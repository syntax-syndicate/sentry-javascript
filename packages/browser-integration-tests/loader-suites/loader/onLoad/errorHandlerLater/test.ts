import { expect } from '@playwright/test';

import { sentryTest } from '../../../../utils/fixtures.ts';
import { envelopeRequestParser, waitForErrorRequestOnUrl } from '../../../../utils/helpers.ts';

sentryTest('error handler works for later errors', async ({ getLocalTestUrl, page }) => {
  const url = await getLocalTestUrl({ testDir: __dirname });
  const req = await waitForErrorRequestOnUrl(page, url);

  const eventData = envelopeRequestParser(req);

  expect(eventData.exception?.values?.length).toBe(1);
  expect(eventData.exception?.values?.[0]?.value).toBe('window.doSomethingWrong is not a function');
});
