import fs from 'fs';

let code = fs.readFileSync('src/worker.ts', 'utf-8');
code = code.replace(/await await/g, "await");
fs.writeFileSync('src/worker.ts', code);
console.log('Fixed double awaits');
