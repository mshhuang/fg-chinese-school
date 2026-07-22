const fs = require('fs');
let code = fs.readFileSync('src/pages/BuilderDatabase.tsx', 'utf8');

code = code.replace(
  "        if (tableName === 'system_logs' || tableName === 'error_logs' || tableName === 'audit_logs') {\n            conditionColumn = 'log_id';\n        }",
  "        if (tableName === 'system_logs') {\n            conditionColumn = 'log_id';\n        }"
);

fs.writeFileSync('src/pages/BuilderDatabase.tsx', code);
console.log('Patched handleClearTable');
