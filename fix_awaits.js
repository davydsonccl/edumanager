import fs from 'fs';

let code = fs.readFileSync('src/worker.ts', 'utf-8');

// Fix missing awaits for db.prepare(...).run(...)
code = code.replace(/const result = db\.prepare\(([^)]+)\)\.run\(([^)]*)\);/g, "const result = await db.prepare($1).run($2);");
code = code.replace(/db\.prepare\(([^)]+)\)\.run\(([^)]*)\);/g, "await db.prepare($1).run($2);");

// Fix req.query
code = code.replace(/req\.query/g, "c.req.query()");

fs.writeFileSync('src/worker.ts', code);
console.log('Fixed missing awaits');
