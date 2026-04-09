import fs from 'fs';

let code = fs.readFileSync('src/worker.ts', 'utf-8');

const start = code.indexOf('// Database Initialization');
const end = code.indexOf('// Auth Middleware');

if (start !== -1 && end !== -1) {
  code = code.substring(0, start) + code.substring(end);
  fs.writeFileSync('src/worker.ts', code);
  console.log('Removed old init code');
} else {
  console.log('Could not find markers');
}
