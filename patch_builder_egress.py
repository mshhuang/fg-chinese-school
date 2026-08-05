import re

with open('src/pages/BuilderDatabase.tsx', 'r') as f:
    text = f.read()

text = text.replace('const egressChartData = [', 'const [egressChartData, setEgressChartData] = useState<any[]>([')
text = text.replace("  { date: '14 Jul', egress: 1.8 },\n];", "  { date: '14 Jul', egress: 1.8 },\n  ]);")

fetch_usage_old = """      const response = await fetch('/api/supabase/proxy', {
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
      
      const data = await response.json();"""

fetch_usage_new = """      const response = await fetch('/api/supabase/proxy', {
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
      
      try {
        const egressRes = await fetch('/api/supabase/proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ref,
                pat: supabasePat,
                path: '/analytics/endpoints/usage.egress-total?interval=1day'
            })
        });
        if (egressRes.ok) {
            const egressData = await egressRes.json();
            let parsedEgress = Array.isArray(egressData) ? egressData : (egressData.result || []);
            if (parsedEgress.length > 0) {
                setEgressChartData(parsedEgress.map((item: any) => ({
                    date: item.timestamp ? new Date(item.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Unknown',
                    egress: item.total_egress || item.egress || (item.total_bytes ? (item.total_bytes / 1073741824).toFixed(2) : 0) || 0
                })));
            }
        }
      } catch(e) {
         console.error("Egress fetch failed", e);
      }
"""

text = text.replace(fetch_usage_old, fetch_usage_new)

with open('src/pages/BuilderDatabase.tsx', 'w') as f:
    f.write(text)
