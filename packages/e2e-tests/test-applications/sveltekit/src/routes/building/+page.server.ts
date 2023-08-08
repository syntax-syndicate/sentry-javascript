import type { PageServerLoad } from './$types.ts';

export const load = (async _event => {
  return { name: 'building (server)' };
}) satisfies PageServerLoad;
