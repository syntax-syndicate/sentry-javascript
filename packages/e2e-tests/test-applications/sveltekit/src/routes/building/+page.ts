import type { PageLoad } from './$types.ts';

export const load = (async _event => {
  return { name: 'building' };
}) satisfies PageLoad;
