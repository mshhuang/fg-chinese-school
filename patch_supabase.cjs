const fs = require('fs');
let code = fs.readFileSync('src/lib/supabase.ts', 'utf8');

// Clear cache on mutations
code = code.replace(
  "if (options && options.method && ['POST', 'PATCH', 'DELETE', 'PUT'].includes(options.method)) {",
  "if (options && options.method && ['POST', 'PATCH', 'DELETE', 'PUT'].includes(options.method)) {\n          queryCache.clear(); // Invalidate cache on mutation"
);

fs.writeFileSync('src/lib/supabase.ts', code);
console.log('Patched');
