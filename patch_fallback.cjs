const fs = require('fs');
let content = fs.readFileSync('src/pages/BuilderDatabase.tsx', 'utf8');

content = content.replace(/                \{JSON\.stringify\(usageData, null, 2\)\}\n             <\/pre>\n          <\/div>\n                \{JSON\.stringify\(usageData, null, 2\)\}\n             <\/pre>\n          <\/div>\n        \)\}/, `                {JSON.stringify(usageData, null, 2)}
             </pre>
          </div>
        )}`);

fs.writeFileSync('src/pages/BuilderDatabase.tsx', content);
