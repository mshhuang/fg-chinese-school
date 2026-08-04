const fs = require('fs');
let code = fs.readFileSync('src/lib/supabase.ts', 'utf8');

code = code.replace(/let user = \{\};/g, 'let user: any = {};');

fs.writeFileSync('src/lib/supabase.ts', code);
