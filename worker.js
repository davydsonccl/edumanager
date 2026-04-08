export default {
  async fetch(request, env) {
    if (!env.DB) {
      return new Response("Banco de dados não configurado", { status: 500 });
    }

    try {
      // Exemplo de consulta - ajuste a tabela conforme necessário
      const { results } = await env.DB.prepare("SELECT * FROM usuarios LIMIT 10").all();
      
      return new Response(JSON.stringify(results), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      return new Response(`Erro no banco: ${error.message}`, { status: 500 });
    }
  }
}
