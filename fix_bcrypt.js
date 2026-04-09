import fs from 'fs';

let code = fs.readFileSync('src/worker.ts', 'utf-8');
code = code.replace(/import bcrypt from 'bcrypt';/g, "import bcrypt from 'bcryptjs';");
fs.writeFileSync('src/worker.ts', code);
console.log('Replaced bcrypt with bcryptjs');
