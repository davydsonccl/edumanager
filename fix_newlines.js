import fs from 'fs';

let code = fs.readFileSync('src/worker.ts', 'utf-8');

code = code.replace(/const queries = schema\.split\(';'\)\.map\(q => q\.trim\(\)\)\.filter\(q => q\.length > 0\);/g, "const queries = schema.split(';').map(q => q.replace(/\\n/g, ' ').trim()).filter(q => q.length > 0);");

fs.writeFileSync('src/worker.ts', code);
console.log('Updated queries splitting to remove newlines');
