// worker.js
export default {
  async fetch(request, env) {
    // O banco está acessível em env.database (nome do binding que você criou)
    try {
      const result = await env.database.prepare("SELECT * FROM usuarios").all();
      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};
``*
