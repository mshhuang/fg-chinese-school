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
          path: '/analytics/endpoints/usage.api-counts?interval=1day'
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
      
      if (Array.isArray(data) && data.length > 0) {
         setUsageData(data[data.length - 1]);
      } else if (data && data.result && data.result.length > 0) {
         setUsageData(data.result[data.result.length - 1]);
      } else {
         setUsageData(data);
      }
    } catch (err: any) {
`;

content = content.replace(/    try \{\s*const response = await fetch\('\/api\/supabase\/proxy'[\s\S]*?\} catch \(err: any\) \{/, newFetch);
fs.writeFileSync('src/pages/BuilderDatabase.tsx', content);
