import fs from 'fs';

let code = fs.readFileSync('src/worker.ts', 'utf-8');

code = code.replace(/return return c\.json/g, 'return c.json');
code = code.replace(/res\.json\(/g, 'return c.json(');
code = code.replace(/return return c\.json/g, 'return c.json');

// Also remove the old auth middleware since we added a new one at the top
const authStart = code.indexOf('// Auth Middleware');
const authEnd = code.indexOf('// API Routes');
if (authStart !== -1 && authEnd !== -1) {
  code = code.substring(0, authStart) + code.substring(authEnd);
}

fs.writeFileSync('src/worker.ts', code);
console.log('Fixed return returns');
