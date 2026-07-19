
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Trash, ShieldAlert, Loader2, Calendar, Database } from 'lucide-react';
import { cn } from '../lib/utils';


const JsonTable = ({ data, colorClass }: { data: any, colorClass: string }) => {
  if (!data || typeof data !== 'object') {
    return <pre className={`text-xs font-mono ${colorClass} whitespace-pre-wrap break-all`}>{JSON.stringify(data, null, 2)}</pre>;
  }
  
  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse text-xs">
        <tbody>
          {Object.entries(data).map(([key, value], idx) => (
            <tr key={idx} className="border-b border-outline-variant/10 last:border-0 hover:bg-surface-variant/10 transition-colors">
              <th className="py-1.5 pr-4 font-mono font-medium text-on-surface-variant whitespace-nowrap align-top">{key}</th>
              <td className={`py-1.5 font-mono ${colorClass} break-all`}>
                {typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<string>("All Tables");

  const groupedLogs = useMemo(() => {
    return logs.reduce((acc, log) => {
      const table = log.table_name || 'unknown';
      if (!acc[table]) acc[table] = [];
      acc[table].push(log);
      return acc;
    }, {} as Record<string, any[]>);
  }, [logs]);

  const uniqueTables = useMemo(() => {
    return Object.keys(groupedLogs).sort();
  }, [groupedLogs]);

  const handleDeleteLog = async (id: string) => {
    const { error } = await supabase.from('audit_logs').delete().eq('id', id);
    if (!error) {
      setLogs(prev => prev.filter(l => l.id !== id));
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setLoading(true);
    try {
       // Mocking to stop fetching data from supabase
       setLogs([]);
    } catch(e) {}
    setLoading(false);
  }

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-on-surface mb-2 flex items-center gap-2">
               <ShieldAlert className="w-8 h-8 text-secondary" />
               Audit Logs
            </h1>
            <p className="font-body text-on-surface-variant">Comprehensive record of data creations, updates, and deletions.</p>
          </div>
          <div className="flex flex-wrap gap-2 self-start md:self-auto">
             <button 
                onClick={async () => {
                   setLoading(true);
                   const thirtyDaysAgo = new Date();
                   thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                   await supabase.from('audit_logs').delete().lt('created_at', thirtyDaysAgo.toISOString());
                   await fetchLogs();
                }}
                className="px-4 py-2 bg-error-container text-on-error-container hover:bg-error/20 rounded-full text-sm font-label transition-colors">
                Clear &gt; 30 Days
             </button>
             <button 
                onClick={async () => {
                   if (selectedTable !== 'All Tables') {
                      setLoading(true);
                      await supabase.from('audit_logs').delete().eq('table_name', selectedTable);
                      await fetchLogs();
                   } else {
                      setLoading(true);
                      await supabase.from('audit_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
                      setLogs([]);
                      await fetchLogs();
                   }
                }}
                className="px-4 py-2 bg-error-container text-on-error-container hover:bg-error/20 rounded-full text-sm font-label transition-colors">
                {selectedTable === 'All Tables' ? 'Clear All Logs' : `Clear ${selectedTable} Logs`}
             </button>
             <button 
                onClick={fetchLogs}
                className="px-4 py-2 bg-surface-container hover:bg-surface-variant rounded-full text-sm font-label transition-colors inline-block">
                Refresh
             </button>
          </div>
        </div>

        {loading ? (
             <div className="flex items-center justify-center p-12 text-on-surface-variant">
                <Loader2 className="w-8 h-8 animate-spin" />
             </div>
        ) : logs.length === 0 ? (
             <div className="text-center p-12 text-on-surface-variant font-body bg-surface-container-low rounded-3xl border border-outline-variant/30">
                <p className="mb-4">No audit logs found. Your <code className="bg-surface px-1 py-0.5 rounded">audit_logs</code> table is ready, but no active database triggers are sending data to it.</p>
                <div className="inline-block bg-surface-container text-left p-4 rounded-xl text-xs md:text-sm border border-outline-variant/30 max-w-2xl overflow-hidden w-full">
                   <p className="font-bold mb-2">Step 1: Create the logging function in Supabase SQL Editor</p>
                   <pre className="font-mono text-[10px] text-on-surface whitespace-pre-wrap break-all rounded bg-surface-lowest p-2 overflow-x-auto mb-4">
{`CREATE OR REPLACE FUNCTION log_table_changes()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id uuid;
  extracted_user_id uuid := NULL;
BEGIN
  BEGIN
    current_user_id := auth.uid();
  EXCEPTION WHEN OTHERS THEN
    current_user_id := NULL;
  END;

  IF current_user_id IS NULL THEN
    BEGIN
      IF (TG_OP = 'DELETE') THEN
        extracted_user_id := (row_to_json(OLD)->>'user_id')::uuid;
      ELSE
        extracted_user_id := (row_to_json(NEW)->>'user_id')::uuid;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      extracted_user_id := NULL;
    END;
    IF extracted_user_id IS NOT NULL THEN
      current_user_id := extracted_user_id;
    END IF;
  END IF;

  IF (TG_OP = 'DELETE') THEN
    INSERT INTO audit_logs (table_name, action, old_data, user_id)
    VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), current_user_id);
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO audit_logs (table_name, action, old_data, new_data, user_id)
    VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW), current_user_id);
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO audit_logs (table_name, action, new_data, user_id)
    VALUES (TG_TABLE_NAME, TG_OP, row_to_json(NEW), current_user_id);
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`}
                   </pre>

                   <p className="font-bold mb-2">Step 2: Attach triggers to all public tables</p>
                   <p className="text-xs mb-2 text-on-surface-variant">Run this block to automatically create auditing triggers for every table in your database (skipping the audit_logs table itself):</p>
                   <pre className="font-mono text-[10px] text-on-surface whitespace-pre-wrap break-all rounded bg-surface-lowest p-2 overflow-x-auto mb-4">
{`DO $$
DECLARE
    tbl RECORD;
BEGIN
    FOR tbl IN
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
          AND table_name != 'audit_logs'
    LOOP
        EXECUTE format(
            'DROP TRIGGER IF EXISTS audit_%I_changes ON public.%I; ' ||
            'CREATE TRIGGER audit_%I_changes ' ||
            'AFTER INSERT OR UPDATE OR DELETE ON public.%I ' ||
            'FOR EACH ROW EXECUTE FUNCTION log_table_changes();',
            tbl.table_name, tbl.table_name, tbl.table_name, tbl.table_name
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;`}
                   </pre>

                   <p className="font-bold mb-2">Optional: Add a cron job to automatically delete logs over 30 days old</p>
                   <p className="text-xs mb-2 text-on-surface-variant font-medium">Note: If you get an error, you must first enable the <strong className="text-on-surface">pg_cron</strong> extension in your Supabase Dashboard (Database → Extensions) or by using the SQL below. When prompted in the UI, select the <strong className="text-on-surface">pg_catalog</strong> schema.</p>
                   <pre className="font-mono text-[10px] text-on-surface whitespace-pre-wrap break-all rounded bg-surface-lowest p-2 overflow-x-auto">
{`CREATE EXTENSION IF NOT EXISTS pg_cron SCHEMA pg_catalog;

SELECT cron.schedule('cleanup_old_audit_logs', '0 0 * * *', $$
  DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '30 days';
$$);`}
                   </pre>
                </div>
             </div>
        ) : (
             <div className="space-y-6">
                 <div className="p-4 bg-surface-container-low border border-outline-variant/30 rounded-xl flex items-center justify-between">
                     <span className="font-medium text-sm text-on-surface-variant">Filter by Table:</span>
                     <select 
                       className="bg-surface border border-outline-variant text-on-surface text-sm rounded-lg block p-2"
                       value={selectedTable}
                       onChange={(e) => setSelectedTable(e.target.value)}
                     >
                       <option value="All Tables">All Tables</option>
                       {uniqueTables.map(name => (
                         <option key={name} value={name}>{name}</option>
                       ))}
                     </select>
                  </div>

                  {Object.entries(groupedLogs)
                     .filter(([tableName]) => selectedTable === "All Tables" || tableName === selectedTable)
                     .map(([tableName, tableLogs]: [string, any[]]) => (
                     <div key={tableName} className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-4 bg-surface-container-low border-b border-outline-variant/30 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary-container text-secondary flex items-center justify-center font-bold text-lg">
                            <Database className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-on-surface font-mono">{tableName}</h3>
                            <p className="text-xs text-on-surface-variant">{tableLogs.length} record{tableLogs.length === 1 ? '' : 's'}</p>
                          </div>
                        </div>
                        <ul className="divide-y divide-outline-variant/30 bg-surface">
                           {tableLogs.map((log) => (
                             <li key={log.id} className="p-4 flex flex-col gap-3 hover:bg-surface-variant/10 transition-colors">
                                <div className="flex flex-wrap items-center gap-3 text-sm">
                                   <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-secondary-container text-on-secondary-container">
                                      {log.action}
                                   </span>
                                   <span className="font-mono text-on-surface font-bold text-xs">{log.id}</span>
                                   <div className="flex items-center gap-1 text-on-surface-variant ml-auto">
                                      <Calendar className="w-3.5 h-3.5" />
                                      <span className="text-xs">{new Date(log.created_at).toLocaleString('en-US', { timeZone: 'America/New_York' , timeZoneName: 'short'})}</span>
                                   </div>
                                   <button
                                      onClick={() => handleDeleteLog(log.id)}
                                      className="ml-2 w-7 h-7 flex items-center justify-center text-error hover:bg-error/10 rounded-full transition-colors shrink-0"
                                      title="Delete Log"
                                   >
                                      <Trash className="w-3.5 h-3.5" />
                                   </button>
                                </div>
                                
                                <div className="text-sm text-on-surface-variant">
                                   <span className="font-bold text-on-surface">User:</span> {log.users ? `${log.users.first_name} ${log.users.last_name}` : (log.user_id || 'System')}
                                </div>

                                {(log.old_data || log.new_data) && (
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                      {log.old_data && (
                                         <div className="bg-surface-lowest p-3 rounded border border-outline-variant/20">
                                            <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-2">Old Data</p>
                                            <JsonTable data={log.old_data} colorClass="text-error" />
                                         </div>
                                      )}
                                      {log.new_data && (
                                         <div className="bg-surface-lowest p-3 rounded border border-outline-variant/20">
                                            <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-2">New Data</p>
                                            <JsonTable data={log.new_data} colorClass="text-primary" />
                                         </div>
                                      )}
                                   </div>
                                )}
                             </li>
                           ))}
                        </ul>
                     </div>
                  ))}
             </div>
        )}
      </div>
    </div>
  );
}
