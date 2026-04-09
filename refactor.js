import fs from 'fs';

let code = fs.readFileSync('server.ts', 'utf-8');

// 1. Replace express with hono
code = code.replace(/import express from 'express';/, "import { Hono } from 'hono';\nimport { cors } from 'hono/cors';");
code = code.replace(/import Database from 'better-sqlite3';/, "");
code = code.replace(/const app = express\(\);/, "const app = new Hono<{ Bindings: { DB: D1Database }, Variables: { user: any } }>();");

// 2. Remove express middlewares
code = code.replace(/app\.use\(cors\(\)\);/, "app.use('/api/*', cors());");
code = code.replace(/app\.use\(express\.json\(\{ limit: '10mb' \}\)\);/, "");
code = code.replace(/app\.use\(express\.urlencoded\(\{ limit: '10mb', extended: true \}\)\);/, "");

// 3. Replace route handlers
// app.get('/api/health', (req, res) => { ... }) -> app.get('/api/health', async (c) => { ... })
code = code.replace(/app\.(get|post|put|delete)\('([^']+)',\s*(?:auth,\s*)?\(req(?:: any)?,\s*res(?:: any)?\)\s*=>\s*\{/g, (match, method, path) => {
  const isAuth = match.includes('auth,');
  return `app.${method}('${path}', ${isAuth ? 'auth, ' : ''}async (c) => {\n  const db = new DBWrapper(c.env.DB);\n`;
});

// 4. Replace req.body, req.params, req.query
code = code.replace(/const (\{[^}]+\}) = req\.body;/g, "const $1 = await c.req.json();");
code = code.replace(/req\.body/g, "(await c.req.json())");
code = code.replace(/req\.params\.([a-zA-Z0-9_]+)/g, "c.req.param('$1')");
code = code.replace(/req\.query\.([a-zA-Z0-9_]+)/g, "c.req.query('$1')");

// 5. Replace req.user
code = code.replace(/req\.user/g, "c.get('user')");

// 6. Replace res.json
code = code.replace(/res\.json\((.*)\);/g, "return c.json($1);");
code = code.replace(/res\.status\((\d+)\)\.json\((.*)\);/g, "return c.json($2, $1);");

// 7. Replace db.prepare
code = code.replace(/db\.prepare\(([^)]+)\)\.(get|all|run)\(([^)]*)\)/g, "await db.prepare($1).$2($3)");
code = code.replace(/db\.exec\(/g, "await db.exec(");

// 8. Auth middleware
code = code.replace(/const auth = \(req: any, res: any, next: any\) => \{[\s\S]*?next\(\);\n\s*\}\);\n\s*\};/, `const auth = async (c: any, next: any) => {
  const token = c.req.header('authorization')?.split(' ')[1];
  if (!token) return c.json({ error: 'Não autorizado' }, 401);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    c.set('user', decoded);
    await next();
  } catch (err) {
    return c.json({ error: 'Token inválido' }, 401);
  }
};`);

// 9. Fix DBWrapper
const dbWrapper = `
class DBWrapper {
  constructor(private d1: any) {}

  prepare(query: string) {
    const stmt = this.d1.prepare(query);
    return {
      get: async (...params: any[]) => {
        return await stmt.bind(...params).first();
      },
      all: async (...params: any[]) => {
        const res = await stmt.bind(...params).all();
        return res.results;
      },
      run: async (...params: any[]) => {
        const res = await stmt.bind(...params).run();
        return { lastInsertRowid: res.meta.last_row_id };
      }
    };
  }
  
  async exec(query: string) {
    await this.d1.exec(query);
  }
}
`;

code = code.replace(/const JWT_SECRET = 'SECRET_KEY_EDU_MANAGER';/, `const JWT_SECRET = 'SECRET_KEY_EDU_MANAGER';\n${dbWrapper}`);

// 10. Remove startServer and just export default app
code = code.replace(/async function startServer\(\) \{[\s\S]*?console\.log\('--- SERVER STARTING ---'\);/, "");
code = code.replace(/const PORT = 3000;/, "");
code = code.replace(/console\.log\('Iniciando banco de dados com better-sqlite3\.\.\.'\);[\s\S]*?const db = new Database\('\.\/database\.db'\);[\s\S]*?console\.log\('Banco de dados conectado\.'\);/, "");

// 11. Move migrations and seed to a special endpoint or handle it differently
// In Cloudflare D1, we usually do migrations via wrangler d1 migrations.
// But to keep it simple, we can put the initialization in a /api/init endpoint.
code = code.replace(/await db\.exec\(`([\s\S]*?)`\);/, "/* DB INIT MOVED */");

// Let's just write the modified code to a new file to inspect it.
fs.writeFileSync('server_hono.ts', code);
