/**
 * Cloudflare Worker Entry Point
 * Este arquivo atua como a ponte entre a rede da Cloudflare e sua aplicação.
 */

export interface Env {
  D1: D1Database;
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // 1. Rotas de API
    // Nota: O Express (server.ts) não roda nativamente aqui.
    // Você precisará migrar a lógica das rotas para cá ou usar um framework como Hono.
    if (url.pathname.startsWith('/api')) {
      if (url.pathname === '/api/health') {
        return new Response(JSON.stringify({ status: 'ok', runtime: 'Cloudflare Workers' }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ 
        error: 'API endpoint not yet migrated to Worker',
        message: 'O servidor Express (server.ts) usa Node.js nativo e não roda no Cloudflare Workers. Use o D1 para persistência.'
      }), {
        status: 501,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Servir Ativos Estáticos (Frontend Vite)
    // O binding ASSETS definido no wrangler.toml permite buscar os arquivos da pasta /dist
    try {
      const response = await env.ASSETS.fetch(request);
      if (response.status !== 404) return response;
      
      // SPA Fallback: Se não encontrar o arquivo, serve o index.html
      return await env.ASSETS.fetch(new Request(new URL('/index.html', url.origin)));
    } catch (e) {
      return new Response('Error loading assets', { status: 500 });
    }
  },
};
