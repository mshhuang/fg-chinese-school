import { useState, useEffect, useMemo } from "react";
import { Activity, Users, Settings, Server, AlertCircle, CheckCircle2, ArrowRight, RefreshCcw, BookOpen, Database, Loader2, ChevronDown, ChevronUp, Trash, Clock, Fingerprint } from "lucide-react";
import { cn } from "../lib/utils";
import { supabase } from "../lib/supabase";

export default function Diagnostics() {
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>("All Users");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [activeSessions, setActiveSessions] = useState<number>(0);

  useEffect(() => {
    async function checkSupabaseAndLoadLogs() {
      try {
        const { error } = await supabase.auth.getSession();
        if (error) throw error;
        setDbStatus('connected');
        
        // Fetch logs
        const { data, error: logsError } = await supabase
          .from('system_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
          
        if (logsError) {
          console.error("Error fetching logs:", logsError);
        } else if (data) {
          setLogs(data);
        }

        // Fetch Total Users
        const { count: usersCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });
        if (usersCount !== null) {
           setTotalUsers(usersCount);
        }

        // Fetch Active Sessions
        const { count: sessionsCount } = await supabase
          .from('user_sessions')
          .select('*', { count: 'exact', head: true })
          .is('logout_time', null);
        if (sessionsCount !== null) {
           setActiveSessions(sessionsCount);
        }

      } catch (err) {
        console.error("Supabase connection error:", err);
        setDbStatus('error');
      } finally {
        setLoading(false);
      }
    }
    checkSupabaseAndLoadLogs();

  }, []);

  const groupedLogs = useMemo(() => {
    return logs.reduce((acc, log) => {
      const userName = log.user_name || 'System Event';
      if (!acc[userName]) acc[userName] = [];
      acc[userName].push(log);
      return acc;
    }, {} as Record<string, any[]>);
  }, [logs]);

  const uniqueUsers = useMemo(() => {
    return Object.keys(groupedLogs).sort();
  }, [groupedLogs]);

  const toggleExpand = (id: string) => {
    setExpandedLogId(prev => prev === id ? null : id);
  };

  const handleDeleteLog = async (id: string) => {
    const { error } = await supabase.from('system_logs').delete().eq('log_id', id);
    if (!error) {
      setLogs(prev => prev.filter(l => l.log_id !== id));
    }
  };

  const [deleteTimeframe, setDeleteTimeframe] = useState<string>("1-week");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleBulkDeleteLogs = async () => {
    setIsDeleting(true);
    try {
      const now = new Date();
      if (deleteTimeframe === "1-week") {
        now.setDate(now.getDate() - 7);
      } else if (deleteTimeframe === "1-month") {
        now.setMonth(now.getMonth() - 1);
      } else if (deleteTimeframe === "all") {
        now.setFullYear(2000); // delete essentially all
      }

      const { error } = await supabase
        .from('system_logs')
        .delete()
        .lt('created_at', now.toISOString());

      if (!error) {
        setLogs(prev => prev.filter(l => new Date(l.created_at) >= now));
      } else {
        console.error("Failed to delete logs:", error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatTime = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { timeZone: 'America/New_York',  hour: '2-digit', minute: '2-digit' , timeZoneName: 'short'});
  };

  return (
    <div className="p-6 md:p-8 flex flex-col gap-8 w-full pb-32 md:pb-8">
      {/* Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h2 className="font-display text-4xl text-on-surface font-bold">Diagnostics</h2>
           <p className="font-body text-lg text-on-surface-variant mt-2">All system services are operating normally.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-secondary-container/20 text-secondary border border-secondary-container/30 px-4 py-2 rounded-full shadow-sm">
             <span className="relative flex h-3 w-3">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
               <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
             </span>
             <span className="font-label text-sm font-bold">System Nominal</span>
          </div>
          <div className={cn(
             "flex items-center gap-2 px-4 py-2 rounded-full shadow-sm border",
             dbStatus === 'checking' ? "bg-outline-variant/10 text-on-surface-variant border-outline-variant/30" :
             dbStatus === 'connected' ? "bg-tertiary-container/30 text-tertiary border-tertiary-container/50" :
             "bg-error-container/30 text-error border-error-container/50"
          )}>
             <Database className="w-4 h-4" />
             <span className="font-label text-sm font-bold">
               {dbStatus === 'checking' ? 'Checking DB...' : dbStatus === 'connected' ? 'Supabase Connected' : 'Supabase Error'}
             </span>
          </div>
        </div>
      </section>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
         <MetricCard title="Total Users" value={totalUsers.toString()} change="Real-time count" icon={Users} trend="neutral" />
         <MetricCard title="Active Sessions" value={activeSessions.toString()} change="Live sessions" icon={Activity} trend="neutral" />
         <MetricCard title="Pending Updates" value="0" change="Up to date" icon={RefreshCcw} trend="neutral" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        
        {/* System Logs */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-3xl border border-surface-variant p-8 shadow-sm flex flex-col gap-6">
           <div className="flex justify-between items-center">
              <h3 className="font-title text-xl text-on-surface font-bold flex items-center gap-2">
                 <Activity className="w-5 h-5 text-primary" /> System Logs
              </h3>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 bg-surface-variant/30 rounded-lg p-1 border border-outline-variant/30">
                    <select
                      className="bg-transparent text-sm font-medium text-on-surface outline-none pr-2"
                      value={deleteTimeframe}
                      onChange={(e) => setDeleteTimeframe(e.target.value)}
                    >
                      <option value="1-week">Older than 1 week</option>
                      <option value="1-month">Older than 1 month</option>
                      <option value="all">All logs</option>
                    </select>
                    <button
                      onClick={handleBulkDeleteLogs}
                      disabled={isDeleting}
                      className="px-3 py-1.5 bg-error text-on-error rounded-md text-xs font-bold hover:bg-error/90 disabled:opacity-50"
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                 </div>
                 <button 
                    onClick={() => {
                      setLoading(true);
                      const checkSupabaseAndLoadLogs = async () => {
                         const { data, error: logsError } = await supabase
                           .from('system_logs')
                           .select('*')
                           .order('created_at', { ascending: false })
                           .limit(100);
                         if (!logsError && data) setLogs(data);
                         setLoading(false);
                      };
                      checkSupabaseAndLoadLogs();
                    }}
                    className="font-label text-sm text-primary hover:underline font-bold">Refresh</button>
              </div>
           </div>
           
           <div className="space-y-4">
             {loading ? (
                <div className="flex items-center justify-center p-8 text-on-surface-variant">
                   <Loader2 className="w-6 h-6 animate-spin" />
                </div>
             ) : logs.length > 0 ? (
                <div className="space-y-6">
                  <div className="p-4 bg-surface-container-low border border-outline-variant/30 rounded-xl flex items-center justify-between">
                     <span className="font-medium text-sm text-on-surface-variant">Filter by User:</span>
                     <select 
                       className="bg-surface border border-outline-variant text-on-surface text-sm rounded-lg block p-2"
                       value={selectedUser}
                       onChange={(e) => setSelectedUser(e.target.value)}
                     >
                       <option value="All Users">All Users</option>
                       {uniqueUsers.map(name => (
                         <option key={name} value={name}>{name}</option>
                       ))}
                     </select>
                  </div>

                  {Object.entries(groupedLogs)
                    .filter(([userName]) => selectedUser === "All Users" || userName === selectedUser)
                    .map(([userName, userLogs]: [string, any[]]) => (
                      <div key={userName} className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-4 bg-surface-container-low border-b border-outline-variant/30 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold text-lg">
                            {userName.replace(/System Event/g, 'S')[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <h3 className="font-bold text-on-surface">{userName}</h3>
                            <p className="text-xs text-on-surface-variant">{userLogs.length} activit{userLogs.length === 1 ? 'y' : 'ies'} recorded</p>
                          </div>
                        </div>
                        <ul className="divide-y divide-outline-variant/30 bg-surface">
                          {userLogs.map((log) => {
                             const type = (log.action_type === 'other' && log.activity?.includes('[WARNING]')) ? 'warning' :
                                          (log.action_type === 'other' && log.activity?.includes('[ERROR]')) ? 'error' :
                                          (log.action_type === 'other' && log.activity?.includes('[SUCCESS]')) ? 'success' : 'info';
                             return (
                             <li key={log.log_id || Math.random()} className="flex flex-col">
                               <div 
                                 className="flex items-start gap-4 p-4 hover:bg-surface-variant/30 cursor-pointer transition-colors border-l-4 border-transparent hover:border-primary/20"
                                 onClick={() => toggleExpand(log.log_id)}
                               >
                                 <div className={cn(
                                   "mt-0.5 p-1.5 rounded-full shrink-0",
                                   type === 'success' ? "bg-secondary-container/20 text-secondary" : 
                                   type === 'error' ? "bg-error-container/20 text-error" : 
                                   type === 'warning' ? "bg-tertiary-container/20 text-tertiary" : "bg-primary-container/20 text-primary"
                                 )}>
                                   <ActivityIcon className="w-4 h-4" />
                                 </div>
                                 <div className="flex-1 min-w-0">
                                   <div className="flex flex-wrap items-center gap-2 mb-1 text-sm">
                                      <span className="font-caption text-xs text-on-surface-variant">{formatTime(log.created_at)}</span>
                                      <span className="text-on-surface-variant">-</span>
                                      <span className="font-body text-on-surface font-medium truncate">{log.activity || 'Unknown Action'}</span>
                                      <ArrowRight className="w-4 h-4 text-on-surface-variant shrink-0" />
                                      {log.page_name && (
                                         <span className="font-caption text-on-surface-variant uppercase tracking-wider">{log.page_name.includes('/') ? log.page_name : `/${log.page_name.toUpperCase()}`}</span>
                                      )}
                                      {(!log.page_name && log.user_name === 'System Event') && (
                                         <span className="font-caption text-on-surface-variant uppercase tracking-wider font-bold">System Event</span>
                                      )}
                                   </div>
                                 </div>
                                 
                                 <div className="flex items-center">
                                   <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteLog(log.log_id);
                                      }}
                                      className="mr-2 w-7 h-7 flex items-center justify-center text-error hover:bg-error/10 rounded-full transition-colors shrink-0"
                                      title="Delete Activity"
                                   >
                                      <Trash className="w-3.5 h-3.5" />
                                   </button>
                                   <div className="ml-2 shrink-0 p-1 rounded-full hover:bg-surface-variant transition-colors">
                                     {expandedLogId === log.log_id ? <ChevronUp className="w-5 h-5 text-on-surface-variant" /> : <ChevronDown className="w-5 h-5 text-on-surface-variant" />}
                                   </div>
                                 </div>
                               </div>

                               {expandedLogId === log.log_id && (
                                 <div className="px-14 pb-5 pt-2 text-sm bg-surface-variant/10 border-t border-outline-variant/10">
                                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                     <div className="space-y-3">
                                       <div>
                                         <h4 className="text-xs font-label uppercase tracking-wider text-on-surface-variant mb-1">Log ID</h4>
                                         <p className="font-mono text-xs">{log.log_id}</p>
                                       </div>
                                       <div>
                                         <h4 className="text-xs font-label uppercase tracking-wider text-on-surface-variant mb-1">User ID</h4>
                                         <p className="font-mono text-xs break-all">{log.user_id || 'N/A'}</p>
                                       </div>
                                       <div>
                                         <h4 className="text-xs font-label uppercase tracking-wider text-on-surface-variant mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Timestamp</h4>
                                         <p className="font-mono text-xs">{new Date(log.created_at).toLocaleString('en-US', { timeZone: 'America/New_York' , timeZoneName: 'short'})}</p>
                                       </div>
                                     </div>

                                     <div className="space-y-3 lg:col-span-1 md:col-span-2">
                                        <div>
                                         <h4 className="text-xs font-label uppercase tracking-wider text-on-surface-variant mb-1 flex items-center gap-1"><Fingerprint className="w-3 h-3" /> Data Captured</h4>
                                         {log.data_changed && Object.keys(log.data_changed).length > 0 ? (
                                            <div className="mt-2">
                                              <pre className="p-3 rounded-lg bg-[#1e1e1e] text-[#d4d4d4] font-mono text-xs overflow-x-auto border border-white/10 shadow-inner">
                                                 {JSON.stringify(log.data_changed, null, 2)}
                                              </pre>
                                            </div>
                                         ) : (
                                            <p className="text-sm font-medium text-on-surface-variant italic mt-2">No additional data captured.</p>
                                         )}
                                        </div>
                                     </div>
                                   </div>
                                 </div>
                               )}
                             </li>
                           )})}
                        </ul>
                      </div>
                    ))}
                </div>
             ) : (
                <div className="text-center p-8 text-on-surface-variant font-body">
                   <p className="mb-4">No system logs found.</p>
                </div>
             )}
           </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-surface-container-lowest rounded-3xl border border-surface-variant p-8 shadow-sm flex flex-col gap-6">
           <h3 className="font-title text-xl text-on-surface font-bold flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" /> Management
           </h3>
           
           <div className="flex flex-col gap-3">
              <button className="w-full flex items-center justify-between p-4 rounded-xl bg-surface-container-low hover:bg-surface-variant/50 border border-outline-variant/30 transition-colors">
                 <span className="font-label font-bold text-on-surface">User Directory</span>
                 <Users className="w-4 h-4 text-on-surface-variant" />
              </button>
              <button className="w-full flex items-center justify-between p-4 rounded-xl bg-surface-container-low hover:bg-surface-variant/50 border border-outline-variant/30 transition-colors">
                 <span className="font-label font-bold text-on-surface">Role Permissions</span>
                 <Settings className="w-4 h-4 text-on-surface-variant" />
              </button>
              <button className="w-full flex items-center justify-between p-4 rounded-xl bg-surface-container-low hover:bg-surface-variant/50 border border-outline-variant/30 transition-colors">
                 <span className="font-label font-bold text-on-surface">Manage Programs</span>
                 <BookOpen className="w-4 h-4 text-on-surface-variant" />
              </button>
           </div>
           
           <div className="mt-auto pt-6 border-t border-outline-variant/20">
              <button className="w-full py-3 rounded-full bg-error-container text-on-error-container font-label font-bold hover:bg-error/20 transition-colors">
                 Restart Services
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}

function MetricCard({ title, value, change, icon: Icon, trend, alert }: any) {
  return (
    <div className={cn(
      "p-6 rounded-2xl border bg-surface-container-lowest shadow-sm flex flex-col gap-4 relative overflow-hidden",
      alert ? "border-error/40 shadow-[0_4px_12px_rgba(179,38,30,0.08)]" : "border-outline-variant/30"
    )}>
       {alert && <div className="absolute top-0 right-0 w-full h-1 bg-error"></div>}
       <div className="flex justify-between items-start">
         <Icon className={cn("w-6 h-6", alert ? "text-error" : "text-primary")} />
         {alert && <AlertCircle className="w-5 h-5 text-error opacity-80" />}
       </div>
       <div>
         <h4 className="font-label text-sm text-on-surface-variant mb-1">{title}</h4>
         <p className="font-display text-3xl font-bold text-on-surface">{value}</p>
         <p className={cn(
           "font-caption text-xs mt-2 font-bold",
           trend === 'up' ? "text-secondary" : trend === 'down' ? "text-tertiary" : "text-on-surface-variant",
           alert && "text-error"
         )}>{change}</p>
       </div>
    </div>
  );
}

function ActivityIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}
