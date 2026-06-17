import React, { useState, useEffect } from "react";
import { 
  Smartphone, Monitor, ArrowRight, ChevronDown, ChevronUp, Clock, Globe, 
  MapPin, Fingerprint, TextSelect, Laptop, AlertCircle, Loader2, Trash
} from "lucide-react";
import { cn } from "../lib/utils";
import { supabase } from "../lib/supabase";

export default function Activities() {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const handleDeleteLog = async (id: string) => {
    const { error } = await supabase.from('system_logs').delete().eq('log_id', id);
    if (!error) {
      setLogs(prev => prev.filter(l => l.log_id !== id));
    }
  };

  useEffect(() => {
    fetchLogs();
    const userStr = localStorage.getItem('user');
    if (userStr) {
       try {
          const user = JSON.parse(userStr);
          setUserRole(user.role);
       } catch (e) {}
    }
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('system_logs')
        .select(`
          log_id,
          user_id,
          user_name,
          user_role,
          page_name,
          path,
          activity,
          action_type,
          data_changed,
          browser,
          ip_address,
          device_type,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setLogs(data || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    if (expandedLogId === id) {
      setExpandedLogId(null);
    } else {
      setExpandedLogId(id);
    }
  };

  const getDeviceIcon = (type: string) => {
    if (!type) return <Monitor className="w-5 h-5 text-blue-500" />;
    switch (type.toLowerCase()) {
      case 'smartphone': 
      case 'mobile':
        return <Smartphone className="w-5 h-5 text-indigo-500" />;
      case 'laptop': return <Laptop className="w-5 h-5 text-indigo-500" />;
      default: return <Monitor className="w-5 h-5 text-blue-500" />;
    }
  };

  const [selectedUser, setSelectedUser] = useState<string>("All Users");

  const groupedLogs = React.useMemo(() => {
    const filtered = logs.filter(log => {
      const userName = log.user_name || 'System';
      if (userRole === 'admin' && (userName === 'System Event' || userName === 'System' || userName.toLowerCase().includes('system'))) return false;
      return true;
    });

    return filtered.reduce((acc, log) => {
      const userName = log.user_name || 'System';
      if (!acc[userName]) acc[userName] = [];
      acc[userName].push(log);
      return acc;
    }, {} as Record<string, any[]>);
  }, [logs, userRole]);

  const uniqueUsers = React.useMemo(() => {
    return Object.keys(groupedLogs).sort();
  }, [groupedLogs]);

  const formatTime = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleDeleteAll = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.from('system_logs').delete().neq('log_id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
      setLogs([]); // instantly clear in UI
      setShowConfirm(false);
      await fetchLogs();
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-3xl font-bold text-on-surface">Recent Activities</h1>
        <div className="flex items-center gap-4">
          <button onClick={fetchLogs} className="text-sm font-medium text-primary hover:underline">
            Refresh
          </button>
          
          {userRole === 'builder' && (
            !showConfirm ? (
               <button 
                 onClick={() => setShowConfirm(true)}
                 className="text-sm font-medium text-red-600 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors"
               >
                 Clear All Logs
               </button>
            ) : (
               <div className="flex items-center gap-2 bg-red-500/10 px-2 py-1 rounded-lg">
                  <span className="text-xs text-red-600 font-bold">Are you sure?</span>
                  <button 
                    onClick={handleDeleteAll}
                    className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
                  >
                    Yes, Delete
                  </button>
                  <button 
                    onClick={() => setShowConfirm(false)}
                    className="text-xs font-bold text-on-surface hover:bg-surface-variant px-2 py-1 rounded"
                  >
                    Cancel
                  </button>
               </div>
            )
          )}
        </div>
      </div>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 p-4 rounded-xl flex items-start gap-3 mb-6">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 flex flex-col items-center justify-center text-on-surface-variant">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="font-medium">Loading activities...</p>
          </div>
        ) : logs.length === 0 && !error ? (
          <div className="p-8 flex flex-col items-center justify-center text-on-surface-variant text-center">
            <ActivityIcon className="w-12 h-12 text-outline-variant mb-4" />
            <p className="font-medium text-lg">No activities recorded yet.</p>
            <p className="text-sm mt-1 max-w-md">User actions will appear here once the system starts logging them.</p>
          </div>
        ) : (
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
             <div>
                  {Object.entries(groupedLogs)
                    .filter(([userName]) => selectedUser === "All Users" || userName === selectedUser)
                    .map(([userName, userLogs]: [string, any[]]) => (
                      <div key={userName} className="mb-6 bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-4 bg-surface-container-low border-b border-outline-variant/30 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold text-lg shrink-0">
                            {userName.replace(/System Event|System/g, 'S')[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <h3 className="font-bold text-on-surface">{userName === "System" ? "System Event" : userName}</h3>
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
                                  {(() => {
                                     const timeStr = new Date(log.created_at).toLocaleString([], { year: '2-digit', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
                                     let actionText = log.activity || 'performed an unknown action';
                                     actionText = actionText.replace(/\[(INFO|ERROR|SUCCESS|WARNING)\]\s+/g, '');
                                     if (actionText.startsWith('Visited page: ')) {
                                       const path = actionText.replace('Visited page: ', '');
                                       const parts = path.split('/').filter(Boolean);
                                       const page = parts[parts.length - 1] || 'Home';
                                       const nicePage = page.charAt(0).toUpperCase() + page.slice(1).replace(/-/g, ' ');
                                       actionText = `visited page: ${nicePage}`;
                                     } else {
                                       actionText = actionText.charAt(0).toLowerCase() + actionText.slice(1);
                                     }
                                     return (
                                       <p className="font-body text-sm text-on-surface truncate whitespace-pre-wrap leading-relaxed">
                                         <span className="text-on-surface-variant mr-2 font-medium">{timeStr}</span>
                                         <span className="text-on-surface-variant whitespace-normal break-words">{actionText}</span>
                                       </p>
                                     );
                                  })()}
                                </div>
                                
                                <div className="flex items-center">
                                  {userRole === 'builder' && (
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
                                  )}
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
                                        <p className="font-mono text-xs">{new Date(log.created_at).toLocaleString()}</p>
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
          </div>
        )}
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
