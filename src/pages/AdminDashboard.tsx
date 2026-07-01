import { useState, useEffect } from "react";
import { Users, BookOpen, Clock, Building2, Save, FileText, Download, Upload, Shield, Printer } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";
import { supabase } from "../lib/supabase";
import { DashboardNotifications } from "../components/DashboardNotifications";
import { formatTeacherName } from "../lib/utils";

export default function AdminDashboard() {
  const [greeting, setGreeting] = useState("Good morning");
  const [user, setUser] = useState<any>(null);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClasses: 0,
    activeRoles: 0,
    activeSessions: 0,
    totalRecords: 0
  });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    const u = localStorage.getItem('user');
    if (u) {
      try {
        setUser(JSON.parse(u));
      } catch (e) {}
    }

    async function loadStats() {
      const [users, classes, roles, sessions, logs] = await Promise.all([
        supabase.from('users').select('user_id', { count: 'exact', head: true }),
        supabase.from('classes').select('class_id', { count: 'exact', head: true }),
        supabase.from('roles').select('role_id', { count: 'exact', head: true }),
        supabase.from('user_sessions').select('id', { count: 'exact', head: true }).is('logout_time', null),
        supabase.from('system_logs').select('log_id', { count: 'exact', head: true })
      ]);

      const uCount = users.count || 0;
      const cCount = classes.count || 0;
      const rCount = roles.count || 0;
      const sCount = sessions.count || 0;
      const lCount = logs.count || 0;

      setStats({
        totalUsers: uCount,
        totalClasses: cCount,
        activeRoles: rCount,
        activeSessions: sCount,
        totalRecords: uCount + cCount + rCount + sCount + lCount
      });
    }

    loadStats();
  }, []);

  return (
    <div className="p-6 md:p-8 flex flex-col gap-8 w-full max-w-7xl mx-auto pb-32 md:pb-8">
      <DashboardNotifications />
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h1 className="font-display text-4xl text-primary font-bold tracking-tight">
              {greeting}, {formatTeacherName(user?.first_name, user?.last_name, 'Admin')}
           </h1>
           <p className="font-body text-lg text-on-surface-variant mt-2">Manage infrastructure, user roles, and database integrity.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-label font-bold hover:bg-primary/90 transition-colors shadow-sm w-full md:w-auto justify-center">
           <Shield className="w-5 h-5" /> Run Audit
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/30 shadow-sm flex items-center gap-4">
           <div className="w-14 h-14 bg-primary-container text-primary rounded-full flex items-center justify-center shrink-0">
              <Users className="w-7 h-7" />
           </div>
           <div>
              <p className="font-label text-sm uppercase tracking-wider text-on-surface-variant font-bold">Total Users</p>
              <h2 className="font-display text-3xl font-bold text-on-surface mt-1">{stats.totalUsers}</h2>
           </div>
        </div>
        <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/30 shadow-sm flex items-center gap-4">
           <div className="w-14 h-14 bg-secondary-container text-secondary rounded-full flex items-center justify-center shrink-0">
              <BookOpen className="w-7 h-7" />
           </div>
           <div>
              <p className="font-label text-sm uppercase tracking-wider text-on-surface-variant font-bold">Total Classes</p>
              <h2 className="font-display text-3xl font-bold text-on-surface mt-1">{stats.totalClasses}</h2>
           </div>
        </div>
        <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/30 shadow-sm flex items-center gap-4">
           <div className="w-14 h-14 bg-tertiary-container text-tertiary rounded-full flex items-center justify-center shrink-0">
              <Building2 className="w-7 h-7" />
           </div>
           <div>
              <p className="font-label text-sm uppercase tracking-wider text-on-surface-variant font-bold">System Roles</p>
              <h2 className="font-display text-3xl font-bold text-on-surface mt-1">{stats.activeRoles}</h2>
           </div>
        </div>
        <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/30 shadow-sm flex items-center gap-4">
           <div className="w-14 h-14 bg-error-container text-error rounded-full flex items-center justify-center shrink-0">
              <Clock className="w-7 h-7" />
           </div>
           <div>
              <p className="font-label text-sm uppercase tracking-wider text-on-surface-variant font-bold">Active Sessions</p>
              <h2 className="font-display text-3xl font-bold text-on-surface mt-1">{stats.activeSessions}</h2>
           </div>
        </div>
      </div>

      <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/30 shadow-sm mt-2">
         <h3 className="font-title text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
            Supabase Database Usage
         </h3>
         <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 w-full space-y-4">
               <div className="flex justify-between items-end">
                 <div>
                    <p className="font-label text-sm uppercase tracking-wider text-on-surface-variant font-bold mb-1">Total Table Records</p>
                    <h2 className="font-display text-4xl font-bold text-on-surface">{stats.totalRecords.toLocaleString()}</h2>
                 </div>
                 <div className="text-right">
                    <p className="font-label text-sm uppercase tracking-wider text-on-surface-variant font-bold mb-1">Storage Equivalent</p>
                    <h2 className="font-display text-2xl font-bold text-on-surface-variant">~{(stats.totalRecords * 1.5 / 1024).toFixed(2)} MB</h2>
                 </div>
               </div>
               <div className="w-full bg-outline-variant/30 rounded-full h-3 overflow-hidden">
                  <div className="bg-primary h-full rounded-full transition-all duration-1000" style={{ width: `${Math.max(2, Math.min(100, (stats.totalRecords / 500000) * 100))}%` }}></div>
               </div>
               <div className="flex justify-between text-xs font-medium text-on-surface-variant">
                  <span>0 Records</span>
                  <span>Free Tier (500,000 DB limit)</span>
               </div>
            </div>
            <div className="hidden md:block w-px h-24 bg-outline-variant/30 mx-4"></div>
            <div className="shrink-0 space-y-3">
               <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span className="text-sm font-medium text-on-surface">Structured Data</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-outline-variant"></div>
                  <span className="text-sm font-medium text-on-surface-variant">Storage Buckets (0 GB)</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-outline-variant"></div>
                  <span className="text-sm font-medium text-on-surface-variant">Bandwidth (0 MB)</span>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/30 shadow-sm flex flex-col items-center text-center">
             <Save className="w-12 h-12 text-primary opacity-50 mb-4" />
             <h3 className="font-title text-xl font-bold text-on-surface mb-2">Data Backups</h3>
             <p className="font-body text-on-surface-variant mb-6 max-w-sm flex-1">Run a manual database export for safe keeping. Exports include user lists, class directories, and historical transactions.</p>
             <button className="flex items-center gap-2 px-6 py-2 border border-primary text-primary rounded-full font-label font-bold hover:bg-primary-container transition-colors w-full justify-center">
                <Download className="w-4 h-4" /> Export CSV
             </button>
          </div>
          
          <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/30 shadow-sm flex flex-col items-center text-center">
             <Upload className="w-12 h-12 text-secondary opacity-50 mb-4" />
             <h3 className="font-title text-xl font-bold text-on-surface mb-2">Bulk Import</h3>
             <p className="font-body text-on-surface-variant mb-6 max-w-sm flex-1">Import enrollments, staff assignments, or user updates via batch CSV files directly into the database.</p>
             <button className="flex items-center gap-2 px-6 py-2 border border-secondary text-secondary rounded-full font-label font-bold hover:bg-secondary-container transition-colors w-full justify-center">
                <Upload className="w-4 h-4" /> Upload CSV
             </button>
          </div>
          
          <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/30 shadow-sm flex flex-col items-center text-center">
             <FileText className="w-12 h-12 text-tertiary opacity-50 mb-4" />
             <h3 className="font-title text-xl font-bold text-on-surface mb-2">System Reports</h3>
             <p className="font-body text-on-surface-variant mb-6 max-w-sm flex-1">View and print comprehensive data reports for teachers, students, and active classes.</p>
             <Link to="/admin/reports" className="flex items-center gap-2 px-6 py-2 bg-tertiary text-on-tertiary rounded-full font-label font-bold hover:bg-tertiary/90 transition-colors w-full justify-center shadow-sm">
                <Printer className="w-4 h-4" /> View & Print
             </Link>
          </div>
      </div>

    </div>
  );
}
