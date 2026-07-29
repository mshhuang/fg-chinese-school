const fs = require('fs');
let code = fs.readFileSync('src/lib/announcementUtils.ts', 'utf8');

code = code.replace(
    /\.limit\(limitCount \? limitCount \* 3 : 200\)/g,
    `.limit(200)`
);

fs.writeFileSync('src/lib/announcementUtils.ts', code);
console.log('done patching announcementUtils');
