import fs from 'fs';
let code = fs.readFileSync('src/lib/supabase.ts', 'utf8');

code = code.replace("      try {\n      const res = await fetch(url, options);\n      \n      try {", "      try {");

fs.writeFileSync('src/lib/supabase.ts', code);
