const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminEnrollments.tsx', 'utf8');

content = content.replace('async function handleSubmit(e: React.FormEvent) {', 'async function handleSubmit(e: any) {');
content = content.replace('e.preventDefault();', 'if (e && typeof e.preventDefault === "function") e.preventDefault();');

fs.writeFileSync('src/pages/AdminEnrollments.tsx', content);
