import { useState, useEffect } from 'react';
import { Database, Table, Key, Users, Settings, Plus, Play, ChevronRight, Activity, Cloud, ArrowLeft, RefreshCw, ExternalLink } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

export default function BuilderDatabase() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tableStats, setTableStats] = useState<any[]>([]);
  const [dbInfo, setDbInfo] = useState<{ size: string, size_bytes?: number, active_connections: number } | null>(null);
  const [rpcMissing, setRpcMissing] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      setRpcMissing(false);
      // Try to fetch real stats via RPC
      const { data, error } = await supabase.rpc('get_db_stats');
      
      if (error) {
        console.warn('RPC failed, falling back to row counts or showing SQL instructions:', error);
        setRpcMissing(true);
        // Fallback: fetch row counts manually as before
        const tables = [
          'users', 'roles', 'user_roles', 'classes', 'programs', 'subjects', 
          'periods', 'rooms', 'parent_child', 'enrollments', 'announcements', 
          'newsletters', 'system_logs', 'error_logs', 'user_sessions', 'audit_logs'
        ];
        
        const stats = [];
        for (const table of tables) {
          const { count } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
            
          stats.push({ name: table, count: count || 0, sizeEstimate: (count || 0) * 1.5, total_size: '~ KB' }); 
        }
        setTableStats(stats.sort((a, b) => b.count - a.count));
      } else if (data) {
        // Data from RPC
        // data.size -> "8 MB" etc
        // data.active_connections -> 4
        // data.tables -> [{ table_name, total_size, raw_size }]
        setDbInfo({
           size: data.size,
           size_bytes: data.size_bytes,
           active_connections: data.active_connections
        });

        // also fetch row counts for these tables to combine
        const tablesList = data.tables || [];
        const seenNames = new Set<string>();
        const uniqueTables = tablesList.filter((t: any) => {
           if (seenNames.has(t.table_name)) return false;
           seenNames.add(t.table_name);
           return true;
        });

        const combinedStats = [];
        for (const t of uniqueTables) {
           const { count } = await supabase
             .from(t.table_name)
             .select('*', { count: 'exact', head: true })
             .limit(1);
           
           combinedStats.push({ 
              name: t.table_name, 
              count: count || 0, 
              total_size: t.total_size 
           });
        }
        setTableStats(combinedStats.sort((a, b) => b.count - a.count));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Stopped pulling usage from supabase to reduce egress
    setFetchingUsage(false);
  }, []);

  
  const [supabasePat, setSupabasePat] = useState(localStorage.getItem('supabase_pat') || '');
  const [usageData, setUsageData] = useState<any>(null);
  const [usageChartData, setUsageChartData] = useState<any[]>([]);
  const egressChartData = [
  { date: '30 Jun', egress: 0.01 },
  { date: '01 Jul', egress: 0.02 },
  { date: '02 Jul', egress: 0.01 },
  { date: '03 Jul', egress: 0.01 },
  { date: '04 Jul', egress: 0.01 },
  { date: '05 Jul', egress: 0.01 },
  { date: '06 Jul', egress: 0.02 },
  { date: '07 Jul', egress: 0.01 },
  { date: '08 Jul', egress: 2.8 },
  { date: '09 Jul', egress: 4.8 },
  { date: '10 Jul', egress: 0.8 },
  { date: '11 Jul', egress: 0.5 },
  { date: '12 Jul', egress: 0.55 },
  { date: '13 Jul', egress: 0.8 },
  { date: '14 Jul', egress: 1.8 },
];
  const [fetchingUsage, setFetchingUsage] = useState(false);
  const [usageError, setUsageError] = useState('');

  const [clearingTable, setClearingTable] = useState<string | null>(null);
  
  const handleClearTable = async (tableName: string) => {
    if (!window.confirm(`Are you sure you want to delete ALL records in ${tableName}? This cannot be undone.`)) return;
    setClearingTable(tableName);
    try {
        let conditionColumn = 'id';
        if (tableName === 'system_logs') {
            conditionColumn = 'log_id';
        }
        const { error: err } = await supabase.from(tableName).delete().neq(conditionColumn, '00000000-0000-0000-0000-000000000000');
        if (err) throw err;
        alert(`Successfully cleared ${tableName}`);
        
        // Refresh stats
        const { count } = await supabase.from(tableName).select('*', { count: 'exact', head: true });
        setTableStats(prev => prev.map(t => t.name === tableName ? { ...t, count: count || 0 } : t));
    } catch (e: any) {
        alert('Failed to clear table: ' + e.message);
    } finally {
        setClearingTable(null);
    }
  };

  const fetchUsage = async () => {
    setFetchingUsage(true);
    setUsageError('');
    if (supabasePat) {
       localStorage.setItem('supabase_pat', supabasePat);
    }
    
    try {
      // @ts-ignore
      const url = import.meta.env.VITE_SUPABASE_URL || '';
      const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
      const ref = match ? match[1] : '';
      
      if (!ref) {
         throw new Error("Could not extract project ref from VITE_SUPABASE_URL");
      }

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
         setUsageChartData(data);
      } else if (data && data.result && data.result.length > 0) {
         setUsageData(data.result[data.result.length - 1]);
         setUsageChartData(data.result);
      } else {
         setUsageData(data);
         setUsageChartData([]);
      }
    } catch (err: any) {
      // Use mock data so the user can see the design even without a token
      setUsageError('Simulating API Metrics (Connection not configured)');
      setUsageData({
         total_rest_requests: 124500,
         total_auth_requests: 3200,
         total_realtime_requests: 850000,
         total_storage_requests: 420
      });
      setUsageChartData([
         { timestamp: 'Mon', total_rest_requests: 4200, total_auth_requests: 110, total_realtime_requests: 21000 },
         { timestamp: 'Tue', total_rest_requests: 3800, total_auth_requests: 150, total_realtime_requests: 25000 },
         { timestamp: 'Wed', total_rest_requests: 5100, total_auth_requests: 230, total_realtime_requests: 31000 },
         { timestamp: 'Thu', total_rest_requests: 4700, total_auth_requests: 210, total_realtime_requests: 28000 },
         { timestamp: 'Fri', total_rest_requests: 6200, total_auth_requests: 300, total_realtime_requests: 41000 },
         { timestamp: 'Sat', total_rest_requests: 2100, total_auth_requests: 80, total_realtime_requests: 15000 },
         { timestamp: 'Sun', total_rest_requests: 1800, total_auth_requests: 50, total_realtime_requests: 12000 },
      ]);
    } finally {

      setFetchingUsage(false);
    }
  };

  const totalRows = tableStats.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-surface-variant pb-6">
          <button 
             onClick={() => navigate(-1)}
             className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container hover:bg-surface-variant text-on-surface transition-colors"
          >
             <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-on-surface">Database Information</h1>
            <p className="font-body text-on-surface-variant">View overall database size, server load, and table metrics.</p>
          </div>
          <button 
             onClick={fetchStats}
             className="px-4 py-2 bg-primary text-on-primary rounded-full hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm font-bold shrink-0"
          >
             <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
             Refresh
          </button>
        </div>

        {rpcMissing && (
           <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-6 mb-6">
              <h3 className="font-bold text-lg text-on-surface mb-2">Enable Advanced Database Stats</h3>
              <p className="text-sm text-on-surface-variant mb-4">You are currently viewing estimated database statistics. To view exact database sizes and active connections, run this SQL function in your Supabase SQL Editor:</p>
              <pre className="font-mono text-[10px] text-on-surface whitespace-pre-wrap break-all rounded bg-surface-lowest p-4 overflow-x-auto border border-outline-variant/30">
{`CREATE OR REPLACE FUNCTION get_db_stats()
RETURNS json AS $$
DECLARE
    db_size text;
    db_size_bytes bigint;
    active_conns int;
    tbl_stats json;
BEGIN
    SELECT pg_size_pretty(pg_database_size(current_database())) INTO db_size;
    SELECT pg_database_size(current_database()) INTO db_size_bytes;
    
    SELECT count(*) INTO active_conns 
    FROM pg_stat_activity 
    WHERE state = 'active';
    
    SELECT json_agg(row_to_json(t)) INTO tbl_stats
    FROM (
        SELECT
            relname AS table_name,
            pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
            pg_total_relation_size(relid) as raw_size
        FROM pg_catalog.pg_statio_user_tables
        WHERE schemaname = 'public'
        ORDER BY raw_size DESC
    ) t;

    RETURN json_build_object(
        'size', db_size,
        'size_bytes', db_size_bytes,
        'active_connections', active_conns,
        'tables', tbl_stats
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`}
              </pre>
           </div>
        )}

        {/* API Usage via Management API */}
        <div className="flex flex-col md:flex-row gap-8 mb-8">
           <div className="w-full md:w-[30%]">
              <h3 className="font-bold text-lg text-on-surface mb-2">Usage Summary</h3>
              <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
                 Your plan includes a limited amount of usage. If exceeded, you may experience restrictions, as you are currently not billed for overages. It may take up to 1 hour to refresh.
              </p>
              
              <div className="text-[10px] font-mono font-bold text-on-surface-variant uppercase tracking-wider mb-3">MORE INFORMATION</div>
              <div className="flex flex-col gap-3">
                 <a href="#" className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors w-fit">
                    How billing works <ExternalLink className="w-3.5 h-3.5" />
                 </a>
                 <a href="#" className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors w-fit">
                    Supabase Plans <ExternalLink className="w-3.5 h-3.5" />
                 </a>
              </div>

              <div className="mt-8 pt-6 border-t border-outline-variant/30">
                 <div className="text-[10px] font-mono font-bold text-on-surface-variant uppercase tracking-wider mb-3">MANAGE ACCESS</div>
                 <div className="relative mb-3">
                    <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <input 
                       type="password"
                       placeholder="Personal Access Token"
                       value={supabasePat}
                       onChange={(e) => setSupabasePat(e.target.value)}
                       className="pl-9 pr-4 py-2 bg-surface-lowest border border-outline-variant/50 rounded-md text-sm outline-none focus:border-primary w-full"
                    />
                 </div>
                 <button
                    onClick={fetchUsage}
                    disabled={fetchingUsage}
                    className="w-full py-2 bg-primary-container text-on-primary-container rounded-md hover:bg-primary-container/80 transition-colors text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                 >
                    {fetchingUsage ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Refresh Metrics"}
                 </button>
                 {usageError && <div className="text-xs text-error mt-2">{usageError}</div>}
              </div>
           </div>
           
           <div className="w-full md:w-[70%] border border-outline-variant/30 rounded-xl overflow-hidden bg-surface-lowest">
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 divide-outline-variant/30">
                 
                 {/* Item 1 */}
                 <div className="p-5 flex justify-between items-center group sm:border-b sm:border-r border-outline-variant/30">
                    <div>
                       <div className="flex items-center gap-1 text-sm text-on-surface-variant group-hover:text-on-surface transition-colors cursor-pointer">
                          Database Size <ChevronRight className="w-4 h-4" />
                       </div>
                       <div className="mt-1 font-mono text-[13px] text-on-surface">
                          {dbInfo?.size || '0 MB'} / 500 MB ({dbInfo?.size_bytes ? ((dbInfo.size_bytes / (500*1024*1024))*100).toFixed(0) : '0'}%)
                       </div>
                    </div>
                    <svg className="w-6 h-6 -rotate-90 transform" viewBox="0 0 36 36">
                       <path className="text-outline-variant/30" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                       <path className="text-on-surface" strokeDasharray={`${dbInfo?.size_bytes ? ((dbInfo.size_bytes / (500*1024*1024))*100) : 0}, 100`} strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                 </div>

                 {/* Item 2 */}
                 <div className="p-5 flex justify-between items-center group sm:border-b border-outline-variant/30">
                    <div>
                       <div className="flex items-center gap-1 text-sm text-on-surface-variant group-hover:text-on-surface transition-colors cursor-pointer">
                          Total REST Requests <ChevronRight className="w-4 h-4" />
                       </div>
                       <div className="mt-1 font-mono text-[13px] text-on-surface">
                          {usageData?.total_rest_requests?.toLocaleString('en-US') || '0'} / 500,000 (<span className="text-on-surface-variant">&lt;1%</span>)
                       </div>
                    </div>
                    <svg className="w-6 h-6 -rotate-90 transform" viewBox="0 0 36 36">
                       <path className="text-outline-variant/30" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                       <path className="text-on-surface" strokeDasharray="1, 100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                 </div>

                 {/* Item 3 */}
                 <div className="p-5 flex justify-between items-center group sm:border-b sm:border-r border-outline-variant/30">
                    <div>
                       <div className="flex items-center gap-1 text-sm text-on-surface-variant group-hover:text-on-surface transition-colors cursor-pointer">
                          Total Auth Requests <ChevronRight className="w-4 h-4" />
                       </div>
                       <div className="mt-1 font-mono text-[13px] text-on-surface">
                          {usageData?.total_auth_requests?.toLocaleString('en-US') || '0'} / 50,000 (<span className="text-on-surface-variant">&lt;1%</span>)
                       </div>
                    </div>
                    <svg className="w-6 h-6 -rotate-90 transform" viewBox="0 0 36 36">
                       <path className="text-outline-variant/30" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                       <path className="text-on-surface" strokeDasharray="1, 100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                 </div>

                 {/* Item 4 */}
                 <div className="p-5 flex justify-between items-center group sm:border-b border-outline-variant/30">
                    <div>
                       <div className="flex items-center gap-1 text-sm text-on-surface-variant group-hover:text-on-surface transition-colors cursor-pointer">
                          Realtime Concurrent Peak Connections <ChevronRight className="w-4 h-4" />
                       </div>
                       <div className="mt-1 font-mono text-[13px] text-on-surface">
                          {dbInfo?.active_connections || '0'} / 200 ({(dbInfo?.active_connections ? ((dbInfo.active_connections / 200)*100).toFixed(0) : '0')}%)
                       </div>
                    </div>
                    <svg className="w-6 h-6 -rotate-90 transform" viewBox="0 0 36 36">
                       <path className="text-outline-variant/30" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                       <path className="text-on-surface" strokeDasharray={`${dbInfo?.active_connections ? ((dbInfo.active_connections / 200)*100) : 0}, 100`} strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                 </div>

                 {/* Item 5 */}
                 <div className="p-5 flex justify-between items-center group sm:border-b sm:border-r border-outline-variant/30">
                    <div>
                       <div className="flex items-center gap-1 text-sm text-on-surface-variant group-hover:text-on-surface transition-colors cursor-pointer">
                          Total Storage Requests <ChevronRight className="w-4 h-4" />
                       </div>
                       <div className="mt-1 font-mono text-[13px] text-on-surface">
                          {usageData?.total_storage_requests?.toLocaleString('en-US') || '0'} / 10,000 (<span className="text-on-surface-variant">&lt;1%</span>)
                       </div>
                    </div>
                    <svg className="w-6 h-6 -rotate-90 transform" viewBox="0 0 36 36">
                       <path className="text-outline-variant/30" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                       <path className="text-on-surface" strokeDasharray="1, 100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                 </div>

                 {/* Item 6 */}
                 <div className="p-5 flex justify-between items-center group sm:border-b border-outline-variant/30">
                    <div>
                       <div className="flex items-center gap-1 text-sm text-on-surface-variant group-hover:text-on-surface transition-colors cursor-pointer">
                          Total Realtime Requests <ChevronRight className="w-4 h-4" />
                       </div>
                       <div className="mt-1 font-mono text-[13px] text-on-surface">
                          {usageData?.total_realtime_requests?.toLocaleString('en-US') || '0'} / 2,000,000 (<span className="text-on-surface-variant">&lt;1%</span>)
                       </div>
                    </div>
                    <svg className="w-6 h-6 -rotate-90 transform" viewBox="0 0 36 36">
                       <path className="text-outline-variant/30" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                       <path className="text-on-surface" strokeDasharray="1, 100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                 </div>

                 {/* Item 7 */}
                 <div className="p-5 flex justify-between items-center group sm:border-r border-outline-variant/30">
                    <div>
                       <div className="flex items-center gap-1 text-sm text-on-surface-variant group-hover:text-on-surface transition-colors cursor-pointer">
                          Monthly Active SSO Users
                       </div>
                       <div className="mt-1 font-mono text-[13px] text-on-surface-variant">
                          Unavailable in plan
                       </div>
                    </div>
                    <button className="px-3 py-1 bg-[#61E7A5] text-emerald-950 font-bold text-xs rounded hover:bg-[#61E7A5]/90 transition-colors">
                       Upgrade
                    </button>
                 </div>


                 {/* Item 8 */}
                 <div className="p-5 flex justify-between items-center group">
                    <div>
                       <div className="flex items-center gap-1 text-sm text-on-surface-variant group-hover:text-on-surface transition-colors cursor-pointer">
                          Storage Image Transformations
                       </div>
                       <div className="mt-1 font-mono text-[13px] text-on-surface-variant">
                          Unavailable in plan
                       </div>
                    </div>
                    <button className="px-3 py-1 bg-[#61E7A5] text-emerald-950 font-bold text-xs rounded hover:bg-[#61E7A5]/90 transition-colors">
                       Upgrade
                    </button>
                 </div>
              </div>
           </div>
        </div>
        
        
        {/* API Usage Chart */}
        {usageChartData && usageChartData.length > 0 && (
           <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl overflow-hidden mb-8 p-6">
              <div className="mb-6">
                 <h3 className="font-bold text-lg text-on-surface">API Requests Over Time</h3>
                 <p className="text-sm text-on-surface-variant">API requests handled in the selected period</p>
              </div>
              <div className="h-[300px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                       data={usageChartData.map(d => ({
                          ...d,
                          name: d.timestamp.includes('T') ? new Date(d.timestamp).getHours() + ':00' : d.timestamp
                       }))}
                       margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    >
                       <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                       <XAxis dataKey="name" stroke="#a1a1aa" tick={{ fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                       <YAxis stroke="#a1a1aa" tick={{ fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                       <Tooltip 
                          contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px' }}
                          itemStyle={{ color: '#e4e4e7' }}
                          cursor={{ fill: '#27272a' }}
                       />
                       <Legend wrapperStyle={{ paddingTop: '20px' }} />
                       <Bar dataKey="total_rest_requests" name="REST API" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                       <Bar dataKey="total_realtime_requests" name="Realtime" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>
        )}

        {/* Egress Usage */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl overflow-hidden mb-8 p-6">
           <div className="mb-6">
              <h3 className="font-bold text-lg text-on-surface mb-4">Egress usage</h3>
              <div className="space-y-3 border-t border-error pt-4">
                 <div className="flex justify-between items-center py-2 border-b border-outline-variant/30">
                    <span className="text-sm text-on-surface-variant">Included in Free Plan</span>
                    <span className="text-sm font-mono text-on-surface">5 GB</span>
                 </div>
                 <div className="flex justify-between items-center py-2 border-b border-outline-variant/30">
                    <span className="text-sm text-on-surface-variant">Used in period</span>
                    <span className="text-sm font-mono text-on-surface">12.81 GB</span>
                 </div>
                 <div className="flex justify-between items-center py-2 border-b border-outline-variant/30">
                    <span className="text-sm text-on-surface-variant">Overage in period</span>
                    <span className="text-sm font-mono text-on-surface">7.81 GB</span>
                 </div>
              </div>
           </div>
           
           <div className="mt-8 mb-6">
              <h3 className="font-bold text-lg text-on-surface">Egress per day</h3>
              <p className="text-sm text-on-surface-variant mt-1">The breakdown of different egress types is inclusive of cached egress, even though it is billed separately.<br/>The data refreshes every hour.</p>
           </div>
           <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart
                    data={egressChartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                 >
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                    <XAxis 
                       dataKey="date" 
                       stroke="#a1a1aa" 
                       tick={{ fill: '#a1a1aa', fontSize: 12 }} 
                       axisLine={false} 
                       tickLine={false}
                       ticks={['30 Jun', '02 Jul', '04 Jul', '06 Jul', '08 Jul', '10 Jul', '11 Jul', '12 Jul', '13 Jul', '14 Jul']}
                    />
                    <YAxis 
                       stroke="#a1a1aa" 
                       tick={{ fill: '#a1a1aa', fontSize: 12 }} 
                       axisLine={false} 
                       tickLine={false} 
                       tickFormatter={(val) => val === 0 ? '0' : `${val}GB`}
                       ticks={[0, 1.4, 2.8, 4.6]}
                    />
                    <Tooltip 
                       contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px' }}
                       itemStyle={{ color: '#e4e4e7' }}
                       cursor={{ fill: '#27272a' }}
                       formatter={(value) => [`${value} GB`, 'Egress']}
                    />
                    <Bar dataKey="egress" name="Egress" fill="#5EBC8C" radius={0} barSize={28} />
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Tables List */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl overflow-hidden">
           <div className="p-6 border-b border-outline-variant/30">
              <h3 className="font-bold text-lg text-on-surface">Tables Overview</h3>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead className="bg-surface-container-lowest font-label text-xs uppercase text-on-surface-variant">
                    <tr>
                       <th className="px-6 py-4 rounded-tl-xl whitespace-nowrap">Table Name</th>
                       <th className="px-6 py-4 whitespace-nowrap">Total Rows</th>
                       <th className="px-6 py-4 whitespace-nowrap">Total Size</th>
                       <th className="px-6 py-4 whitespace-nowrap">Row Activity</th>
                       <th className="px-6 py-4 whitespace-nowrap">Status</th>
                       <th className="px-6 py-4 rounded-tr-xl whitespace-nowrap">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-outline-variant/30">
                    {loading ? (
                       <tr>
                          <td colSpan={6} className="p-8 text-center text-on-surface-variant font-medium">
                             Loading database statistics...
                          </td>
                       </tr>
                    ) : tableStats.map((stat, i) => (
                       <tr key={stat.name} className="hover:bg-surface-container-lowest/50 transition-colors">
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-3">
                                <Table className="w-4 h-4 text-primary" />
                                <span className="font-mono font-medium text-sm text-on-surface">{stat.name}</span>
                             </div>
                          </td>
                          <td className="px-6 py-4 font-mono text-sm text-on-surface-variant">
                             {stat.count.toLocaleString('en-US')}
                          </td>
                          <td className="px-6 py-4 font-mono text-sm text-on-surface-variant">
                             {stat.total_size || 'N/A'}
                          </td>
                          <td className="px-6 py-4">
                             <div className="w-full bg-surface-variant rounded-full h-1.5 max-w-[100px]">
                                <div 
                                  className="bg-primary h-1.5 rounded-full" 
                                  style={{ width: `${Math.min(100, (stat.count / (totalRows || 1)) * 100)}%` }}
                                ></div>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <span className="px-2 py-1 bg-green-500/10 text-green-600 rounded text-xs font-bold uppercase">
                                Accessible
                             </span>
                          </td>
                          <td className="px-6 py-4">
                             {['system_logs', 'error_logs', 'audit_logs'].includes(stat.name) && (
                                <button 
                                   onClick={() => handleClearTable(stat.name)}
                                   disabled={clearingTable === stat.name}
                                   className="px-3 py-1.5 bg-error/10 text-error hover:bg-error/20 rounded text-xs font-bold transition-colors disabled:opacity-50"
                                >
                                   {clearingTable === stat.name ? 'Clearing...' : 'Clear Data'}
                                </button>
                             )}
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

      </div>
    </div>
  );
}
