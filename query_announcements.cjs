const fs = require('fs');
let code = fs.readFileSync('supabase/migrations/20240101000000_initial_schema.sql', 'utf8');
const lines = code.split('\n');
const start = lines.findIndex(l => l.includes('CREATE TABLE announcements'));
const end = lines.findIndex((l, i) => i > start && l.includes(');'));
console.log(lines.slice(start, end + 1).join('\n'));
