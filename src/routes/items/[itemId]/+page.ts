import type { Load } from '@sveltejs/kit';

export const ssr = false;

export const load: Load = async (ctx) => {
 const { itemId } = ctx.params;
 return { props: { itemId } };
};
