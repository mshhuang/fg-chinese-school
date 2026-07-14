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
          path: '/analytics/endpoints/usage.api-counts?interval=1day' // Note: This might not be the correct public API endpoint, but we'll try
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
         if (response.status === 401 || response.status === 403) {
            throw new Error('Unauthorized: Invalid Personal Access Token');
         }
         throw new Error(\`Failed to fetch usage: \${data.error || response.statusText}\`);
      }
      
      // Some endpoints return an array or object
      if (Array.isArray(data) && data.length > 0) {
         setUsageData(data[data.length - 1]);
      } else if (data && data.result && data.result.length > 0) {
         setUsageData(data.result[data.result.length - 1]);
      } else {
         // Just a fallback
         setUsageData({
           total_rest_requests: 0,
           total_auth_requests: 0,
           total_realtime_requests: 0,
           total_storage_requests: 0,
           empty: true 
         });
      }
    } catch (err: any) {
`;

// use string replace for safety
content = content.replace("    try {\n      const response = await fetch(`https://api.supabase.com/v1/projects/${ref}/analytics/endpoints/usage.api-counts?interval=1day`, {\n        headers: {\n          'Authorization': `Bearer ${supabasePat}`,\n          'Content-Type': 'application/json'\n        }\n      });\n      \n      if (!response.ok) {\n         if (response.status === 401) {\n            throw new Error('Unauthorized: Invalid Personal Access Token');\n         }\n         throw new Error(`Failed to fetch usage: ${response.statusText}`);\n      }\n      \n      const data = await response.json();\n      if (data && data.result && data.result.length > 0) {\n         const latest = data.result[data.result.length - 1];\n         setUsageData(latest);\n      } else {\n         setUsageData({ empty: true });\n      }\n    } catch (err: any) {", newFetch);

fs.writeFileSync('src/pages/BuilderDatabase.tsx', content);
