const fs = require('fs');
let content = fs.readFileSync('src/pages/Announcements.tsx', 'utf8');
const lines = content.split('\n');
lines.splice(564, 10); // Remove lines 565-574 (0-indexed 564-573)
content = lines.join('\n');
fs.writeFileSync('src/pages/Announcements.tsx', content);
