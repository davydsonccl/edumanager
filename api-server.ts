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
            return { 
              lastInsertRowid: info.lastInsertRowid,
              meta: { last_row_id: info.lastInsertRowid }
            };
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
    // We call the init-db logic by simulating a request to the app
    const res = await mainApp.request('/api/init-db', { method: 'POST' });
    const data = await res.json();
    console.log('Database initialization result:', data);
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
