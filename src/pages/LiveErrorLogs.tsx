
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TerminalSquare, Loader2, AlertCircle, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';

export default function LiveErrorLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<'type' | 'path' | 'user'>('type');

  useEffect(() => {
    fetchLogs();
    const userStr = localStorage.getItem('user');
    if (userStr) {
       try {
          setUserRole(JSON.parse(userStr).role);
       } catch (e) {}
    }
    
    // Subscribe to new errors in real-time
    const subscription = supabase
      .channel('system_errors_channel')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'error_logs'
      }, (payload) => {
         setLogs((current) => [payload.new, ...current].slice(0, 100)); // Keep last 100
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  async function fetchLogs() {
    setLoading(true);
    const { data, error } = await supabase
      .from('error_logs')
      .select('*, users(first_name, last_name, email)')
      .order('created_at', { ascending: false })
      .limit(100);
      
    if (!error && data) {
       setLogs(data);
    }
    setLoading(false);
  }

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-on-surface mb-2 flex items-center gap-2">
               <TerminalSquare className="w-8 h-8 text-error" />
               Live Error Logs
            </h1>
            <p className="font-body text-on-surface-variant">Real-time feed of system warnings and explicit error messages.</p>
          </div>
          <div className="flex items-center gap-3">
             <select
               value={groupBy}
               onChange={(e) => setGroupBy(e.target.value as 'type' | 'path' | 'user')}
               className="bg-surface-container border border-outline-variant/30 text-on-surface text-sm rounded-xl px-3 py-2 outline-none focus:border-primary transition-colors"
             >
               <option value="type">Group by Type</option>
               <option value="path">Group by Path</option>
               <option value="user">Group by User</option>
             </select>
            {userRole === 'builder' && (
              !showConfirm ? (
                 <button 
                   onClick={() => setShowConfirm(true)}
                   className="text-sm font-medium text-red-600 bg-red-500/10 hover:bg-red-500/20 px-4 py-2 rounded-xl transition-colors"
                 >
                   Clear Live Error Logs
                 </button>
              ) : (
                 <div className="flex items-center gap-2 bg-red-500/10 px-2 py-1 rounded-xl">
                    <span className="text-sm text-red-600 font-bold ml-1">Are you sure?</span>
                    <button 
                      onClick={async () => {
                         try {
                           setLoading(true);
                           const { data, error: fetchErr } = await supabase.from('error_logs').select('id');
                           if (fetchErr) throw fetchErr;
                           if (data && data.length > 0) {
                              const ids = data.map((d: any) => d.id);
                              const { error } = await supabase.from('error_logs').delete().in('id', ids);
                              if (error) throw error;
                           }
                           setLogs([]);
                           setShowConfirm(false);
                           await fetchLogs();
                         } catch(e: any) { 
                           alert("Error clearing logs: " + e.message); 
                           setLoading(false);
                         }
                      }}
                      className="text-sm font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg"
                    >
                      Yes, Delete
                    </button>
                    <button 
                      onClick={() => setShowConfirm(false)}
                      className="text-sm font-bold text-on-surface hover:bg-surface-variant px-3 py-1.5 rounded-lg"
                    >
                      Cancel
                    </button>
                 </div>
              )
            )}
            <button 
               onClick={fetchLogs}
               className="px-4 py-2 bg-surface-container hover:bg-surface-variant rounded-full text-sm font-label transition-colors self-start md:self-auto">
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
                <p className="mb-4">No error logs found.</p>
                <div className="inline-block bg-surface-container text-left p-4 rounded-xl text-xs md:text-sm border border-outline-variant/30 max-w-2xl overflow-hidden">
                   <p className="font-bold mb-2">Please run this block in your Supabase SQL Editor to create the error logs table:</p>
                   <pre className="font-mono text-[10px] text-on-surface whitespace-pre-wrap break-all rounded bg-surface-lowest p-2 overflow-x-auto">
{`CREATE TABLE error_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(user_id),
  type text NOT NULL, /* error, warning */
  message text NOT NULL,
  details jsonb,
  path text,
  created_at timestamp with time zone default now()
);

ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "error_logs_policy" ON error_logs; CREATE POLICY "error_logs_policy" ON error_logs FOR ALL USING (true) WITH CHECK (true);
`}
                   </pre>
                </div>
             </div>
        ) : (
             <div className="space-y-8">
                {Object.entries(
                  logs.reduce((acc, log) => {
                    let groupKey = 'unknown';
                    if (groupBy === 'type') {
                       groupKey = log.type || 'unknown';
                    } else if (groupBy === 'path') {
                       groupKey = log.path || 'Unknown Path';
                    } else if (groupBy === 'user') {
                       groupKey = log.users ? `${log.users.first_name} ${log.users.last_name}` : (log.user_id || 'System');
                    }
                    if (!acc[groupKey]) acc[groupKey] = [];
                    acc[groupKey].push(log);
                    return acc;
                  }, {} as Record<string, any[]>)
                ).map(([type, typeLogs]) => (
                   <div key={type} className="space-y-4">
                      <h2 className="text-xl font-bold uppercase tracking-wider text-on-surface mb-2 flex items-center gap-2">
                         {type} <span className="bg-surface-variant text-on-surface-variant px-2 py-0.5 rounded-full text-sm font-mono">{typeLogs.length}</span>
                      </h2>
                      {typeLogs.map((log) => (
                   <div key={log.id} className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/30 flex flex-col gap-3">
                      <div className="flex items-center gap-3 text-sm">
                         <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider",
                            log.type === 'error' ? "bg-error-container text-on-error-container" : "bg-tertiary-container text-on-tertiary-container"
                         )}>
                            {log.type}
                         </span>
                         <span className="font-mono text-on-surface font-bold break-all">{log.path || 'Unknown Path'}</span>
                         <div className="flex items-center gap-1 text-on-surface-variant ml-auto shrink-0">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="text-xs">{new Date(log.created_at).toLocaleString()}</span>
                         </div>
                      </div>
                      
                      <div className="text-sm text-on-surface">
                         <AlertCircle className={cn("w-4 h-4 inline-block mr-2", log.type === 'error' ? 'text-error' : 'text-tertiary')} />
                         <span className="font-bold">{log.message}</span>
                      </div>

                      <div className="text-xs text-on-surface-variant">
                         <span className="font-bold text-on-surface">User:</span> {log.users ? `${log.users.first_name} ${log.users.last_name}` : (log.user_id || 'System')}
                      </div>

                      {log.details && (
                         <div className="bg-surface-lowest p-3 rounded border border-outline-variant/20 mt-2 overflow-x-auto">
                            <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-2">Stack Trace / Details</p>
                            <pre className="text-xs font-mono text-error whitespace-pre-wrap break-all">{typeof log.details === 'object' ? JSON.stringify(log.details, null, 2) : log.details}</pre>
                         </div>
                      )}
                   </div>
                      ))}
                   </div>
                ))}
             </div>
        )}
      </div>
    </div>
  );
}
