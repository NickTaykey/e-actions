import type { Load } from '@sveltejs/kit';

export const ssr = false;

export const load: Load = async (ctx) => {
 return { props: {} };
};
