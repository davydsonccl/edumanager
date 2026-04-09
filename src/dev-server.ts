import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';
import Database from 'better-sqlite3';
import app from './worker.ts';
import * as path from 'path';
import * as fs from 'fs';

const dbFile = 'local-database.db';
const sqlite = new Database(dbFile);

// Mock D1
const mockD1 = {
  prepare: (query: string) => {
    const stmt = sqlite.prepare(query);
    return {
      bind: (...params: any[]) => {
        return {
          first: async () => stmt.get(...params),
          all: async () => ({ results: stmt.all(...params) }),
          run: async () => {
            const info = stmt.run(...params);
            return { meta: { last_row_id: info.lastInsertRowid } };
          }
        };
      }
    };
  },
  exec: async (query: string) => {
    sqlite.exec(query);
  }
};

const devApp = new Hono();

// Inject mock DB into context
devApp.use('*', async (c, next) => {
  (c.env as any) = { DB: mockD1 };
  await next();
});

// Route to main app
devApp.route('/', app);

// Serve static files from dist
devApp.use('/*', serveStatic({ root: './dist' }));

// SPA Fallback
devApp.get('*', async (c) => {
  try {
    const html = fs.readFileSync(path.resolve('./dist/index.html'), 'utf-8');
    return c.html(html);
  } catch (e) {
    return c.text('Frontend not built. Run build first.', 404);
  }
});

const port = 3000;
console.log(`Dev server starting on http://localhost:${port}`);

serve({
  fetch: devApp.fetch,
  port
});
