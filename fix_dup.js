const fs = require('fs');
let code = fs.readFileSync('src/lib/supabase.ts', 'utf8');

code = code.replace(/      try \{\n      const res = await fetch\(url, options\);\n      \n      try \{/g, '      try {');

fs.writeFileSync('src/lib/supabase.ts', code);
