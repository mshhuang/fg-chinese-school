const fs = require('fs');
let code = fs.readFileSync('src/pages/BuilderDatabase.tsx', 'utf8');

code = code.replace(
  "  useEffect(() => {\n    // Stopped pulling info from supabase to reduce egress\n    setLoading(false);\n    setFetchingUsage(false);\n  }, []);",
  "  useEffect(() => {\n    fetchStats();\n    // Stopped pulling usage from supabase to reduce egress\n    setFetchingUsage(false);\n  }, []);"
);

fs.writeFileSync('src/pages/BuilderDatabase.tsx', code);
console.log('Patched useEffect');
