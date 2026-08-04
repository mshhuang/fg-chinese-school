const fs = require('fs');
let code = fs.readFileSync('src/lib/supabase.ts', 'utf8');
code = code.replace(/if \(errorData && \(errorData\.code \|\| errorData\.message\)\) \{\n\n              if \(errorData && \(errorData\.code \|\| errorData\.message\)\) \{/, `if (errorData && (errorData.code || errorData.message)) {`);
fs.writeFileSync('src/lib/supabase.ts', code);
