import fs from 'fs';

let code = fs.readFileSync('src/worker.ts', 'utf-8');

code = code.replace(/const result = db\.prepare\(([\s\S]*?)\)\.run\(([\s\S]*?)\);/g, "const result = await db.prepare($1).run($2);");
code = code.replace(/db\.prepare\(([\s\S]*?)\)\.run\(([\s\S]*?)\);/g, "await db.prepare($1).run($2);");

fs.writeFileSync('src/worker.ts', code);
console.log('Fixed multiline awaits');
