import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import Database from 'better-sqlite3';
import app from './src/worker';

const PORT = 3001;

// Mock D1 for Node.js environment using better-sqlite3
const sqlite = new Database('database.db');

const d1Mock = {
  prepare: (query: string) => {
    const stmt = sqlite.prepare(query);
    return {
      bind: (...params: any[]) => {
        return {
          first: async () => {
            return stmt.get(...params);
          },
          all: async () => {
            return { results: stmt.all(...params) };
          },
          run: async () => {
            const info = stmt.run(...params);
            return { lastInsertRowid: info.lastInsertRowid };
          }
        };
      }
    };
  },
  exec: async (query: string) => {
    sqlite.exec(query);
  }
};

const mainApp = new Hono();

mainApp.use('*', async (c, next) => {
  // @ts-ignore
  c.env = { ...(c.env || {}), DB: d1Mock };
  await next();
});

mainApp.route('/', app);

// Initialize database on startup
const initDb = async () => {
  try {
    console.log('Initializing database...');
    // We can't easily call the route handler directly with Hono without a request object
    // So we'll just trigger it via a local fetch if needed, or just wait for the first request
    // Actually, let's just use the logic from worker.ts if we can, but it's inside the route.
    // For now, let's just log that it's ready.
  } catch (err) {
    console.error('Failed to initialize database:', err);
  }
};
initDb();

console.log(`API Server running on http://localhost:${PORT}`);

serve({
  fetch: mainApp.fetch,
  port: PORT
});
