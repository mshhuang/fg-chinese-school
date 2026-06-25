import { useState, useEffect } from 'react';
import { Database, Table, ArrowLeft, RefreshCw, Activity, HardDrive } from 'lucide-react';
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
  }, []);

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

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <Table className="w-5 h-5" />
                 </div>
                 <div>
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total Tables</p>
                    <h2 className="text-2xl font-bold text-on-surface font-title">{tableStats.length}</h2>
                 </div>
              </div>
           </div>
           
           <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center">
                    <Database className="w-5 h-5" />
                 </div>
                 <div>
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total Rows</p>
                    <h2 className="text-2xl font-bold text-on-surface font-title">{totalRows.toLocaleString()}</h2>
                 </div>
              </div>
           </div>

           <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-tertiary/10 text-tertiary rounded-xl flex items-center justify-center">
                    <HardDrive className="w-5 h-5" />
                 </div>
                 <div className="flex-1 w-full flex flex-col">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Database Size</p>
                    <div className="flex items-end justify-between w-full">
                      <h2 className="text-2xl font-bold text-on-surface font-title">{dbInfo?.size || 'Unknown'}</h2>
                      <span className="text-xs text-on-surface-variant font-medium">/ 500 MB</span>
                    </div>
                 </div>
              </div>
              {dbInfo?.size_bytes && (
                 <div className="w-full bg-surface-variant rounded-full h-1.5 mt-auto relative overflow-hidden" title={`${((dbInfo.size_bytes / (500 * 1024 * 1024)) * 100).toFixed(2)}% used`}>
                    <div 
                       className={cn("h-1.5 rounded-full duration-500", (dbInfo.size_bytes / (500 * 1024 * 1024)) > 0.8 ? "bg-error" : "bg-tertiary")}
                       style={{ width: `${Math.min(100, (dbInfo.size_bytes / (500 * 1024 * 1024)) * 100)}%` }}
                    ></div>
                 </div>
              )}
           </div>

           <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-error/10 text-error rounded-xl flex items-center justify-center">
                    <Activity className="w-5 h-5" />
                 </div>
                 <div>
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Active Conns</p>
                    <div className="flex items-center gap-2">
                       {dbInfo ? (
                          <>
                             <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                             <h2 className="text-2xl font-bold text-on-surface font-title">{dbInfo.active_connections}</h2>
                          </>
                       ) : (
                          <h2 className="text-2xl font-bold text-on-surface font-title">N/A</h2>
                       )}
                    </div>
                 </div>
              </div>
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
                       <th className="px-6 py-4 rounded-tr-xl whitespace-nowrap">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-outline-variant/30">
                    {loading ? (
                       <tr>
                          <td colSpan={5} className="p-8 text-center text-on-surface-variant font-medium">
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
                             {stat.count.toLocaleString()}
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
