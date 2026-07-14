const fs = require('fs');
let content = fs.readFileSync('src/pages/BuilderDatabase.tsx', 'utf8');

// Ensure recharts is imported
if (!content.includes('from "recharts"')) {
    content = content.replace(/import \{.*\} from 'lucide-react';/, "import { Database, Table as TableIcon, Key, Users, Settings, Plus, Play, ChevronRight, Activity, Cloud } from 'lucide-react';\nimport { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';");
}

const mockFetch = `
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
         throw new Error(data.error || data.message || response.statusText);
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
      // Use mock data so the user can see the design even without a token
      setUsageError('Using mock data (Original error: ' + err.message + ')');
      setUsageData({
         total_rest_requests: 124500,
         total_auth_requests: 3200,
         total_realtime_requests: 850000,
         total_storage_requests: 420,
         egress_data: [
            { name: 'Mon', Egress: 4.2, Cached: 1.1 },
            { name: 'Tue', Egress: 3.8, Cached: 1.5 },
            { name: 'Wed', Egress: 5.1, Cached: 2.3 },
            { name: 'Thu', Egress: 4.7, Cached: 2.1 },
            { name: 'Fri', Egress: 6.2, Cached: 3.0 },
            { name: 'Sat', Egress: 2.1, Cached: 0.8 },
            { name: 'Sun', Egress: 1.8, Cached: 0.5 },
         ]
      });
    } finally {
`;

content = content.replace(/    try \{\s*const response = await fetch\('\/api\/supabase\/proxy'[\s\S]*?\} catch \(err: any\) \{[\s\S]*?\} finally \{/, mockFetch);

fs.writeFileSync('src/pages/BuilderDatabase.tsx', content);
