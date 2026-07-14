const fs = require('fs');
const content = fs.readFileSync('src/pages/BuilderDatabase.tsx', 'utf8');

const newImports = "import { Database, Table, ArrowLeft, RefreshCw, Activity, HardDrive, Key, BarChart3, AlertCircle } from 'lucide-react';";
let updatedContent = content.replace(/import { Database[^}]* } from 'lucide-react';/, newImports);

const usageStates = `
  const [supabasePat, setSupabasePat] = useState(localStorage.getItem('supabase_pat') || '');
  const [usageData, setUsageData] = useState<any>(null);
  const [fetchingUsage, setFetchingUsage] = useState(false);
  const [usageError, setUsageError] = useState('');

  const fetchUsage = async () => {
    if (!supabasePat) {
       setUsageError("Please provide a Personal Access Token.");
       return;
    }
    setFetchingUsage(true);
    setUsageError('');
    localStorage.setItem('supabase_pat', supabasePat);
    
    const url = import.meta.env.VITE_SUPABASE_URL || '';
    const match = url.match(/https:\\/\\/([^.]+)\\.supabase\\.co/);
    const ref = match ? match[1] : '';
    
    if (!ref) {
       setUsageError("Could not extract project ref from VITE_SUPABASE_URL");
       setFetchingUsage(false);
       return;
    }

    try {
      const response = await fetch(\`https://api.supabase.com/v1/projects/\${ref}/analytics/endpoints/usage.api-counts?interval=1day\`, {
        headers: {
          'Authorization': \`Bearer \${supabasePat}\`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
         if (response.status === 401) {
            throw new Error('Unauthorized: Invalid Personal Access Token');
         }
         throw new Error(\`Failed to fetch usage: \${response.statusText}\`);
      }
      
      const data = await response.json();
      if (data && data.result && data.result.length > 0) {
         const latest = data.result[data.result.length - 1];
         setUsageData(latest);
      } else {
         setUsageData({ empty: true });
      }
    } catch (err: any) {
      setUsageError(err.message);
    } finally {
      setFetchingUsage(false);
    }
  };
`;

updatedContent = updatedContent.replace(
  "const totalRows = tableStats.reduce((acc, curr) => acc + curr.count, 0);",
  usageStates + "\\n  const totalRows = tableStats.reduce((acc, curr) => acc + curr.count, 0);"
);

const usageJSX = `
        {/* API Usage via Management API */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl overflow-hidden">
           <div className="p-6 border-b border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                 <h3 className="font-bold text-lg text-on-surface flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Supabase API Usage (Last 24h)
                 </h3>
                 <p className="text-sm text-on-surface-variant">View project API requests via the Supabase Management API.</p>
              </div>
              <div className="flex items-center gap-2">
                 <div className="relative">
                    <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <input 
                       type="password"
                       placeholder="Personal Access Token"
                       value={supabasePat}
                       onChange={(e) => setSupabasePat(e.target.value)}
                       className="pl-9 pr-4 py-2 bg-surface-lowest border border-outline-variant/50 rounded-full text-sm outline-none focus:border-primary w-[250px]"
                    />
                 </div>
                 <button
                    onClick={fetchUsage}
                    disabled={fetchingUsage}
                    className="px-4 py-2 bg-primary text-on-primary rounded-full hover:bg-primary/90 transition-colors text-sm font-bold flex items-center gap-2 disabled:opacity-50"
                 >
                    {fetchingUsage ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Fetch"}
                 </button>
              </div>
           </div>
           
           <div className="p-6">
              {usageError && (
                 <div className="flex items-center gap-2 text-error bg-error/10 p-3 rounded-xl mb-4 text-sm font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p>{usageError}</p>
                 </div>
              )}
              
              {!usageData && !usageError && !fetchingUsage && (
                 <div className="text-center py-8 text-on-surface-variant text-sm">
                    Enter your Supabase Personal Access Token to view API usage statistics.
                 </div>
              )}
              
              {usageData && !usageData.empty && (
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-surface-lowest border border-outline-variant/20 rounded-2xl p-4">
                       <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Total REST</p>
                       <h4 className="text-2xl font-bold font-title text-on-surface">{usageData.total_rest_requests?.toLocaleString() || 0}</h4>
                    </div>
                    <div className="bg-surface-lowest border border-outline-variant/20 rounded-2xl p-4">
                       <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Total Auth</p>
                       <h4 className="text-2xl font-bold font-title text-on-surface">{usageData.total_auth_requests?.toLocaleString() || 0}</h4>
                    </div>
                    <div className="bg-surface-lowest border border-outline-variant/20 rounded-2xl p-4">
                       <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Total Realtime</p>
                       <h4 className="text-2xl font-bold font-title text-on-surface">{usageData.total_realtime_requests?.toLocaleString() || 0}</h4>
                    </div>
                    <div className="bg-surface-lowest border border-outline-variant/20 rounded-2xl p-4">
                       <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Total Storage</p>
                       <h4 className="text-2xl font-bold font-title text-on-surface">{usageData.total_storage_requests?.toLocaleString() || 0}</h4>
                    </div>
                 </div>
              )}
              
              {usageData && usageData.empty && (
                 <div className="text-center py-8 text-on-surface-variant text-sm">
                    No usage data available for the last 24 hours.
                 </div>
              )}
           </div>
        </div>
`;

updatedContent = updatedContent.replace(
  "{/* Tables List */}",
  usageJSX + "\\n\\n        {/* Tables List */}"
);

fs.writeFileSync('src/pages/BuilderDatabase.tsx', updatedContent);
console.log('File patched');
