const fs = require('fs');
let content = fs.readFileSync('src/pages/BuilderDatabase.tsx', 'utf8');

const newFetch = `
    try {
      const response = await fetch('/api/supabase/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ref,
          pat: supabasePat,
          path: '/usage' // Let's try /usage first
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
         if (response.status === 401 || response.status === 403) {
            throw new Error('Unauthorized: Invalid Personal Access Token');
         }
         throw new Error(\`Failed to fetch usage: \${data.error || data.message || response.statusText}\`);
      }
      
      console.log('Usage Data:', data);
      
      if (data && data.usage) {
         // Some usage format
         setUsageData(data.usage);
      } else {
         setUsageData(data);
      }
    } catch (err: any) {
`;

content = content.replace(/    try \{\s*const response = await fetch\('\/api\/supabase\/proxy'[\s\S]*?\} catch \(err: any\) \{/, newFetch);
fs.writeFileSync('src/pages/BuilderDatabase.tsx', content);
