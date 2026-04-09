import fs from 'fs';

let code = fs.readFileSync('src/worker.ts', 'utf-8');

// Find the init-db block and clean up the SQL
const startMarker = "await db.exec(`";
const endMarker = "    `);";

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const sqlContent = code.substring(startIndex + startMarker.length, endIndex);
  const cleanedSql = sqlContent.split(';').map(s => s.trim()).filter(s => s.length > 0).join('; ') + ';';
  
  const newInitBlock = `    const queries = \`${cleanedSql}\`.split(';').filter(q => q.trim());
    for (const q of queries) {
      await db.exec(q);
    }`;
    
  code = code.substring(0, startIndex) + newInitBlock + code.substring(endIndex + endMarker.length);
  fs.writeFileSync('src/worker.ts', code);
  console.log('Refactored init-db to run queries individually');
} else {
  console.log('Could not find init-db block');
}
