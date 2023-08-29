/**
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
  async fetch(request, env, ctx) {
    const {searchParams} = new URL(request.url);
    return new Response(`Hello ${searchParams.get('name') ?? 'World'}!`);
  },
};
