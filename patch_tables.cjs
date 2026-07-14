const fs = require('fs');
let content = fs.readFileSync('src/pages/BuilderDatabase.tsx', 'utf8');

content = content.replace(
  "tableStats.map((stat, i) => (",
  "tableStats.filter(stat => stat.name === 'system_logs').map((stat, i) => ("
);

fs.writeFileSync('src/pages/BuilderDatabase.tsx', content);
console.log('Done');
