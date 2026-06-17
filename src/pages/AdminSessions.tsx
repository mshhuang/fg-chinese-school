import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Clock, Globe, Shield, RefreshCcw, MonitorSmartphone, Power } from "lucide-react";
import { cn } from "../lib/utils";

export default function AdminSessions() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [confirmEndId, setConfirmEndId] = useState<string | null>(null);

  const [userRole, setUserRole] = useState<string | null>(null);

  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchSessions();
    const userStr = localStorage.getItem('user');
    if (userStr) {
       try {
          const user = JSON.parse(userStr);
          setUserRole(user.role);
       } catch (e) {}
    }
  }, []);

  async function fetchSessions() {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*, users(first_name, last_name, email)')
      .order('login_time', { ascending: false })
      .limit(50);
      
    if (data) {
      setSessions(data);
    }
    setLoading(false);
  }

  async function handleEndSession(id: string) {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ logout_time: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      setConfirmEndId(null);
      await fetchSessions();
    } catch (err: any) {
      alert("Error ending session: " + err.message);
    }
  }

  return (
    <div className="p-6 md:p-8 flex flex-col gap-8 w-full max-w-7xl mx-auto pb-32 md:pb-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h1 className="font-display text-4xl text-primary font-bold tracking-tight">Active Sessions</h1>
           <p className="font-body text-lg text-on-surface-variant mt-2">Monitor user logins, session duration, and device information.</p>
        </div>
        <div className="flex items-center gap-3">
           {userRole === 'builder' && (
              !showConfirm ? (
                 <button 
                   onClick={() => setShowConfirm(true)}
                   className="text-sm font-medium text-red-600 bg-red-500/10 hover:bg-red-500/20 px-4 py-2 rounded-xl transition-colors"
                 >
                   Clear All Sessions
                 </button>
              ) : (
                 <div className="flex items-center gap-2 bg-red-500/10 px-2 py-1 rounded-xl">
                    <span className="text-sm text-red-600 font-bold ml-1">Are you sure?</span>
                    <button 
                      onClick={async () => {
                         try {
                           setLoading(true);
                           const { data, error: fetchErr } = await supabase.from('user_sessions').select('id');
                           if (fetchErr) throw fetchErr;
                           if (data && data.length > 0) {
                              const ids = data.map((d: any) => d.id);
                              const { error } = await supabase.from('user_sessions').delete().in('id', ids);
                              if (error) throw error;
                           }
                           setSessions([]);
                           setShowConfirm(false);
                           await fetchSessions();
                         } catch(e: any) { 
                           alert("Error clearing sessions: " + e.message); 
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
              onClick={fetchSessions}
              className="bg-surface-container text-on-surface p-3 rounded-full hover:bg-surface-variant transition-colors"
              title="Refresh"
           >
              <RefreshCcw className="w-5 h-5" />
           </button>
        </div>
      </header>

      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 overflow-hidden shadow-sm">
        {loading ? (
           <div className="p-12 text-center text-on-surface-variant font-body">Loading...</div>
        ) : sessions.length === 0 ? (
           <div className="p-12 text-center text-on-surface-variant font-body">
              <p className="mb-4">No sessions found.</p>
              <div className="inline-block bg-surface-container text-left p-4 rounded-xl text-xs md:text-sm border border-outline-variant/30">
                 <p className="font-bold mb-2">To use session tracking, run this in your Supabase SQL Editor:</p>
                 <pre className="font-mono text-[10px] text-on-surface overflow-x-auto whitespace-pre rounded bg-surface-lowest">
{`CREATE TABLE user_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(user_id),
  login_time timestamp with time zone default now(),
  logout_time timestamp with time zone,
  ip_address text,
  user_agent text,
  location text,
  activity_summary text,
  session_token text,
  created_at timestamp with time zone default now()
);

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_sessions_policy" ON user_sessions; CREATE POLICY "user_sessions_policy" ON user_sessions FOR ALL USING (true) WITH CHECK (true);`}
                 </pre>
              </div>
           </div>
        ) : (
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant/30 text-on-surface-variant">
                       <th className="p-4 font-label text-xs uppercase tracking-wider font-bold">User</th>
                       <th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Duration</th>
                       <th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Login Time</th>
                       <th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Logout Time</th>
                       <th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Device</th>
                       <th className="p-4 font-label text-xs uppercase tracking-wider font-bold text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="font-body text-sm divide-y divide-outline-variant/20">
                    {sessions.map(s => {
                       const loginTime = new Date(s.login_time).getTime();
                       const logoutTime = s.logout_time ? new Date(s.logout_time).getTime() : Date.now();
                       const diffMs = logoutTime - loginTime;
                       const diffHrs = Math.floor(diffMs / 3600000);
                       const diffMins = Math.floor((diffMs % 3600000) / 60000);
                       let durationStr = '';
                       if (diffHrs > 0) durationStr += `${diffHrs}h `;
                       durationStr += `${diffMins}m`;
                       if (durationStr === '0m') durationStr = '< 1m';

                       return (
                       <tr key={s.id} className="hover:bg-surface-container-lowest/50">
                          <td className="p-4">
                             <div className="font-bold text-on-surface">
                                {s.users ? `${s.users.first_name} ${s.users.last_name}` : (s.activity_summary === 'builder' ? 'Huey Huang (Builder)' : 'Unknown')}
                             </div>
                             {s.users?.email && <div className="text-xs text-on-surface-variant">{s.users.email}</div>}
                          </td>
                          <td className="p-4">
                             <span className="text-on-surface font-medium">
                                {durationStr}
                             </span>
                          </td>
                          <td className="p-4 text-on-surface-variant">
                             {new Date(s.login_time).toLocaleString()}
                          </td>
                          <td className="p-4 text-on-surface-variant">
                             {s.logout_time ? new Date(s.logout_time).toLocaleString() : <span className="text-primary font-bold bg-primary-container/20 px-2 py-0.5 rounded-full text-xs">Active</span>}
                          </td>
                          <td className="p-4">
                             <div className="flex items-center gap-2 max-w-[200px]" title={s.user_agent}>
                               <MonitorSmartphone className="w-4 h-4 text-on-surface-variant shrink-0" />
                               <span className="text-xs text-on-surface-variant truncate">
                                  {s.user_agent?.split(' ')?.slice(0,3)?.join(' ') || 'Unknown'}
                               </span>
                             </div>
                          </td>
                           <td className="p-4 text-right">
                              {!s.logout_time && (
                                 confirmEndId === s.id ? (
                                    <div className="flex items-center gap-2 justify-end bg-red-500/10 px-2 py-1 rounded-lg inline-flex">
                                       <span className="text-xs text-red-600 font-bold">End session?</span>
                                       <button 
                                         onClick={() => handleEndSession(s.id)}
                                         className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
                                       >
                                         Yes
                                       </button>
                                       <button 
                                         onClick={() => setConfirmEndId(null)}
                                         className="text-xs font-bold text-on-surface hover:bg-surface-variant px-2 py-1 rounded"
                                       >
                                         No
                                       </button>
                                    </div>
                                 ) : (
                                    <button 
                                      onClick={() => setConfirmEndId(s.id)}
                                      className="text-xs font-bold text-red-600 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                                    >
                                      <Power className="w-3 h-3" />
                                      End
                                    </button>
                                 )
                              )}
                           </td>
                       </tr>
                    );
                    })}
                 </tbody>
              </table>
           </div>
        )}
      </div>
    </div>
  );
}
