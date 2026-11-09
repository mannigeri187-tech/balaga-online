export default {
  async fetch(request, env) {
    if (env.ASSETS) {
      const response = await env.ASSETS.fetch(request);
      if (response.status === 404) {
        // SPA fallback to index.html
        const url = new URL(request.url);
        url.pathname = "/index.html";
        return env.ASSETS.fetch(new Request(url.toString(), request));
      }
      return response;
    }
    return new Response("Balaga Online Worker Active", { status: 200 });
  },
};
