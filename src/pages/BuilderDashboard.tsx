
import React, { useState, useEffect } from 'react';
import { Server, TerminalSquare, ShieldAlert, Activity, ArrowRight, Users, Power, AlertTriangle, Download, Upload, Database, CheckCircle, XCircle, Unlock, Clock, MessageSquare, Settings, School, Github } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

export default function BuilderDashboard() {
  const navigate = useNavigate();
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [totalUsersCount, setTotalUsersCount] = useState<number>(0);
  const [isMaintenance, setIsMaintenance] = useState(localStorage.getItem('system_maintenance') === 'true');
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const performBackup = async () => {
    setIsBackingUp(true);
    try {
      const tables = ['users', 'roles', 'user_roles', 'classes', 'programs', 'subjects', 'periods', 'rooms', 'parent_child', 'enrollments', 'announcements', 'newsletters'];
      const backupData: Record<string, any[]> = {};
      
      for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*');
        if (!error && data) {
          backupData[table] = data;
        }
      }
      
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Backup failed.');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsRestoring(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        let successCount = 0;
        for (const [table, records] of Object.entries(data)) {
           if (Array.isArray(records) && records.length > 0) {
              const { error } = await supabase.from(table).upsert(records);
              if (!error) successCount++;
           }
        }
        alert(`Restore completed! Successfully restored ${successCount} tables.`);
      } catch (err) {
        alert('Restore failed. Invalid file or database error.');
      } finally {
        setIsRestoring(false);
        if (event.target) event.target.value = '';
      }
    };
    reader.onerror = () => setIsRestoring(false);
    reader.readAsText(file);
  };

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*, users(first_name, last_name, email)')
        .is('logout_time', null)
        .order('login_time', { ascending: false });
        
      if (data) {
        setOnlineUsers(data);
      }

      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      if (count !== null) setTotalUsersCount(count);
    }
    fetchData();
    
    
    
  }, []);

  const toggleMaintenance = () => {
    const newState = !isMaintenance;
    setIsMaintenance(newState);
    localStorage.setItem('system_maintenance', newState.toString());
    if (newState) {
      alert("System is now in maintenance mode. Non-builder users will be blocked.");
    } else {
      alert("System maintenance mode disabled. Operations are back to normal.");
    }
  };

  const cards = [
    { title: 'Database & API Metrics', desc: 'Monitor database statistics, API usage, and egress metrics.', icon: Database, href: '/builder/database', color: 'text-primary', bg: 'bg-primary-container' },
    { title: 'Sessions', desc: 'Monitor active user sessions across the system.', icon: Clock, href: '/builder/sessions', color: 'text-primary', bg: 'bg-primary-container' },
    { title: 'Password Reminders', desc: 'View and manage password reset requests.', icon: Unlock, href: '/builder/password-reminders', color: 'text-primary', bg: 'bg-primary-container' },
    { title: 'Internal Messages Monitor', desc: 'Monitor internal messages sorted by date.', icon: MessageSquare, href: '/builder/internal-messages', color: 'text-secondary', bg: 'bg-secondary-container' },
    { title: 'Management', desc: 'System management and settings.', icon: Settings, href: '/builder/management', color: 'text-tertiary', bg: 'bg-tertiary-container' },
    { title: 'Classes', desc: 'Manage system classes and schedules.', icon: School, href: '/builder/classes', color: 'text-primary', bg: 'bg-primary-container' },
        { title: 'GitHub Sync', desc: 'Sync files to GitHub repository.', icon: Github, href: '/builder/github-sync', color: 'text-primary', bg: 'bg-primary-container' },
    { title: 'System Logs', desc: 'General system logs, lifecycle, and operations.', icon: Server, href: '/builder/system-logs', color: 'text-primary', bg: 'bg-primary-container' },
    { title: 'Live Error Logs', desc: 'Real-time feed of system warnings and errors.', icon: TerminalSquare, href: '/builder/error-logs', color: 'text-error', bg: 'bg-error-container' },
    { title: 'Audit Logs', desc: 'Comprehensive record of data creation, updates, and deletions.', icon: ShieldAlert, href: '/builder/audit-logs', color: 'text-secondary', bg: 'bg-secondary-container' },
    { title: 'Recent Activities', desc: 'User login events and page interactions.', icon: Activity, href: '/builder/activities', color: 'text-tertiary', bg: 'bg-tertiary-container' }
  ];

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
             <h1 className="font-display text-2xl md:text-3xl font-bold text-on-surface mb-2">Builder Dashboard</h1>
             <p className="font-body text-on-surface-variant">
               Monitor system operations, view real-time errors, and access comprehensive audit logs. 
             </p>
          </div>
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <button 
              onClick={performBackup}
              disabled={isBackingUp}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-label font-bold transition-all shadow-sm bg-surface-variant text-on-surface-variant hover:bg-surface-variant/80 border border-outline-variant/30 justify-center disabled:opacity-50"
            >
               <Download className="w-4 h-4" />
               {isBackingUp ? "Backing up..." : "Backup"}
            </button>
            <label className="flex items-center gap-2 px-4 py-2 rounded-xl font-label font-bold transition-all shadow-sm bg-surface-variant text-on-surface-variant hover:bg-surface-variant/80 border border-outline-variant/30 justify-center cursor-pointer disabled:opacity-50">
               <Upload className="w-4 h-4" />
               {isRestoring ? "Restoring..." : "Restore"}
               <input type="file" accept=".json" className="hidden" onChange={handleRestore} disabled={isRestoring} />
            </label>
            <button 
              onClick={toggleMaintenance}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl font-label font-bold transition-all shadow-sm justify-center",
                isMaintenance ? "bg-error text-on-error hover:bg-error/90" : "bg-surface-variant text-on-surface-variant hover:bg-surface-variant/80 border border-outline-variant/30"
              )}
            >
               {isMaintenance ? <AlertTriangle className="w-4 h-4" /> : <Power className="w-4 h-4" />}
               {isMaintenance ? "Resume Operations" : "Shutdown"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Users KPI */}
          <div className="bg-surface-container-low rounded-3xl p-6 border border-outline-variant/30 shadow-sm flex items-center gap-4">
             <div className="w-12 h-12 bg-tertiary-container text-tertiary rounded-xl flex items-center justify-center shrink-0">
                 <Users className="w-6 h-6" />
             </div>
             <div>
                <p className="text-sm font-label font-bold text-on-surface-variant uppercase tracking-wider mb-1">Total Users</p>
                <h2 className="font-title text-3xl font-bold text-on-surface">{totalUsersCount}</h2>
             </div>
          </div>

          {/* Active Sessions KPI */}
          <div className="bg-surface-container-low rounded-3xl p-6 border border-outline-variant/30 shadow-sm flex items-center gap-4">
             <div className="w-12 h-12 bg-primary-container text-primary rounded-xl flex items-center justify-center shrink-0">
                 <Activity className="w-6 h-6" />
             </div>
             <div>
                <p className="text-sm font-label font-bold text-on-surface-variant uppercase tracking-wider mb-1">Active Sessions</p>
                <h2 className="font-title text-3xl font-bold text-on-surface">{onlineUsers.length}</h2>
             </div>
          </div>


          {/* System Online Status KPI */}
          <div className="bg-surface-container-low rounded-3xl p-6 border border-outline-variant/30 shadow-sm flex items-center gap-4">
             <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", isMaintenance ? "bg-error-container text-error" : "bg-primary-container text-primary")}>
                 {isMaintenance ? <XCircle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
             </div>
             <div>
                <p className="text-sm font-label font-bold text-on-surface-variant uppercase tracking-wider mb-1">System Status</p>
                <h2 className="font-title text-2xl font-bold text-on-surface">
                   {isMaintenance ? "Maintenance" : "Online"}
                </h2>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card, i) => (
            <div key={i} onClick={() => navigate(card.href)} className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant/30 hover:border-outline-variant/60 cursor-pointer shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${card.bg} ${card.color}`}>
                  <card.icon className="w-7 h-7" />
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container text-on-surface-variant group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
              <h3 className="font-title text-xl font-bold text-on-surface mb-2">{card.title}</h3>
              <p className="font-body text-on-surface-variant">{card.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 relative p-6 md:p-8 rounded-3xl bg-surface-container-low border border-outline-variant/30 shadow-sm overflow-hidden">
           <div className="absolute top-0 right-0 w-1/2 h-full bg-primary-fixed/20 -z-10 blur-3xl opacity-50"></div>
           <h3 className="font-title text-2xl font-bold text-on-surface mb-2">Simulate Roles & Demo Access</h3>
           <p className="font-body text-on-surface-variant mb-6 text-sm max-w-2xl">Select a role below to simulate their dashboard perspective. You can return to the Builder view using the top-left role switcher at any time.</p>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {[
                 { id: 'admin', title: "Admin Portal", roleName: "Emily" },
                 { id: 'teacher', title: "Teacher Portal", roleName: "Chen Jian" },
                 { id: 'student', title: "Student Portal", roleName: "Mei Lin" },
                 { id: 'parent', title: "Parent Portal", roleName: "Wei Lin" },
                 { id: 'staff', title: "Staff/Volunteer", roleName: "David" }
               ].map((role) => (
                   <button
                       key={role.id}
                       onClick={() => {
                          const currentStr = localStorage.getItem('user');
                          let userRoles = ['builder', role.id];
                          if (currentStr) {
                             const currentUser = JSON.parse(currentStr);
                             userRoles = Array.from(new Set([...(currentUser.availableRoles || []), role.id]));
                          }
                          localStorage.setItem('user', JSON.stringify({
                             id: 'demo',
                             first_name: role.roleName,
                             last_name: 'User',
                             role: role.id,
                             availableRoles: userRoles
                          }));
                          window.dispatchEvent(new Event('storage'));
                          navigate(`/${role.id}/dashboard`);
                       }}
                       className="flex items-center justify-between text-left bg-surface-container rounded-2xl p-4 border border-outline-variant/20 transition-all hover:bg-surface-variant hover:border-primary/50 group"
                   >
                       <div>
                         <p className="font-title text-sm font-bold text-on-surface group-hover:text-primary transition-colors">{role.title}</p>
                         <p className="font-body text-xs text-on-surface-variant">Assume role as {role.roleName}</p>
                       </div>
                       <ArrowRight className="w-4 h-4 text-on-surface-variant group-hover:text-primary transition-colors" />
                   </button>
               ))}
           </div>
        </div>
      </div>
    </div>
  );
}
