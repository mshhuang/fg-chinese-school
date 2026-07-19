import React, { useEffect, useState } from "react";
import { Unlock, Clock, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function PasswordReminderRequests() {
  const [passwordRequests, setPasswordRequests] = useState<any[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const { data: requestLogs } = await supabase
        .from('system_logs')
        .select('*')
        .ilike('activity', '%Password Reminder Request%')
        .order('created_at', { ascending: false });
      if (requestLogs) {
        setPasswordRequests(requestLogs);
      }
    }
    fetchData();
  }, []);

  const handleDelete = async (logId: string) => {
    // confirm removed due to iframe sandbox limits
    
    setIsDeleting(logId);
    try {
      const { error } = await supabase
        .from('system_logs')
        .delete()
        .eq('log_id', logId);
      
      if (error) throw error;
      
      setPasswordRequests(prev => prev.filter(req => req.log_id !== logId));
    } catch (err) {
      console.error("Error deleting request:", err);
      alert("Failed to delete request");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
             <h1 className="font-display text-2xl md:text-3xl font-bold text-on-surface mb-2">Password Reminder Requests</h1>
             <p className="font-body text-on-surface-variant">
               Manage recent requests submitted via the Forgot Password portal.
             </p>
          </div>
        </div>

        <div className="p-6 md:p-8 rounded-3xl bg-surface-container-low border border-outline-variant/30 shadow-sm">
           <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary-container text-primary flex items-center justify-center">
                 <Unlock className="w-5 h-5" />
              </div>
              <div>
                 <h3 className="font-title text-xl font-bold text-on-surface">Requests</h3>
                 <p className="text-sm text-on-surface-variant hidden md:block">Recent requests requiring review.</p>
              </div>
           </div>
           
           {passwordRequests && passwordRequests.length > 0 ? (
               <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                       <thead>
                           <tr className="border-b border-outline-variant/30 text-on-surface-variant font-label text-sm">
                               <th className="pb-3 font-medium">Time (UTC)</th>
                               <th className="pb-3 font-medium">Requested User Name</th>
                               <th className="pb-3 font-medium">IP Addr / Device</th>
                               <th className="pb-3 font-medium text-right">Status</th>
                               <th className="pb-3 font-medium text-right">Actions</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-outline-variant/30">
                           {passwordRequests.map((req) => (
                               <tr key={req.log_id || Math.random()} className="hover:bg-surface/50 transition-colors">
                                   <td className="py-3 text-sm text-on-surface">
                                       {new Date(req.created_at).toLocaleString('en-US', { timeZone: 'America/New_York' , timeZoneName: 'short'})}
                                   </td>
                                   <td className="py-3 text-sm font-bold text-on-surface">
                                       {req.data_changed?.username || req.user_name || "Unknown"}
                                   </td>
                                   <td className="py-3 text-sm text-on-surface-variant">
                                       <span className="font-mono text-xs bg-surface-variant px-2 py-1 rounded">{req.ip_address || "Unknown"}</span>
                                   </td>
                                   <td className="py-3 text-sm text-right">
                                       <span className="inline-flex items-center gap-1 text-tertiary font-label text-xs uppercase tracking-wider bg-tertiary-container/30 px-2 py-1 rounded-full">
                                          <Clock className="w-3 h-3" /> Pending Review
                                       </span>
                                   </td>
                                   <td className="py-3 text-sm text-right">
                                       <button
                                         onClick={() => handleDelete(req.log_id)}
                                         disabled={isDeleting === req.log_id}
                                         className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-lg transition-colors disabled:opacity-50"
                                         title="Delete Request"
                                       >
                                         <Trash2 className="w-4 h-4" />
                                       </button>
                                   </td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
               </div>
           ) : (
               <div className="text-center p-8 border border-dashed border-outline-variant/40 rounded-2xl text-on-surface-variant text-sm font-medium">
                   No password reminder requests found.
               </div>
           )}
        </div>
      </div>
    </div>
  );
}
