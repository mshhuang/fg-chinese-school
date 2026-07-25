const fs = require('fs');
const content = fs.readFileSync('src/lib/announcementUtils.ts', 'utf8');
console.log(content);
