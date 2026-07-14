const fs = require('fs');
let content = fs.readFileSync('src/pages/BuilderDatabase.tsx', 'utf8');

// Replace everything between {/* Overview Cards */} and {/* API Usage via Management API */}
content = content.replace(/{\/\* Overview Cards \*\/}[\s\S]*?(?={\/\* API Usage via Management API \*\/})/m, '');

fs.writeFileSync('src/pages/BuilderDatabase.tsx', content);
