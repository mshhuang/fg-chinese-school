import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchVisibleAnnouncements } from "../lib/announcementUtils";
import { supabase } from "../lib/supabase";
import { Users, BookOpen, ClipboardCheck, Coins, UserCheck, UserPlus, Megaphone, CheckCircle2, FileText, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import { DashboardNotifications } from "../components/DashboardNotifications";
import { formatTeacherName, extractPlainText } from "../lib/utils";

const data = [
  { name: 'Mon', students: 500 },
  { name: 'Tue', students: 512 },
  { name: 'Wed', students: 518 },
  { name: 'Thu', students: 530 },
  { name: 'Fri', students: 542 },
];

export default function PrincipalDashboard() {
  const [stats, setStats] = useState<{ totalStudents: number; activeClasses: number; absencesToday: string | number }>({ totalStudents: 0, activeClasses: 0, absencesToday: "Pending" });
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const navigate = useNavigate();

  const [greeting, setGreeting] = useState("Good morning");
  const [user, setUser] = useState<any>(null);

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

    async function loadData() {
      // Load Stats
      const { count: classesCount } = await supabase.from('classes').select('*', { count: 'exact', head: true });
      
      let studentCount = 0;
      const { data: roleData } = await supabase.from('roles').select('role_id').ilike('role_name', '%student%');
      if (roleData && roleData.length > 0) {
        const studentRoleIds = roleData.map(r => r.role_id);
        const { count: sCount } = await supabase.from('user_roles').select('*', { count: 'exact', head: true }).in('role_id', studentRoleIds);
        studentCount = sCount || 0;
      }
      
      // Load Absences Today
      const today = new Date().toLocaleDateString('en-CA');
      
      const { data: attData } = await supabase.from('attendance')
        .select('class_id, status, student_id')
        .eq('attendance_date', today);
        
      const { data: allCls } = await supabase.from('classes').select('class_id');
      
      let absencesToday: string | number = "Pending";
      if (attData && allCls) {
         // Show the count of absences if any attendance was submitted today, otherwise Pending
         if (attData.length > 0) {
            absencesToday = attData.filter(a => a.status === 'Absent').length;
         } else {
            absencesToday = "Pending";
         }
      }
      
      setStats({ totalStudents: studentCount, activeClasses: classesCount || 0, absencesToday });

      // Load Announcements
      const annData = await fetchVisibleAnnouncements(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : user, localStorage.getItem('current_role') || 'principal', 3);
      if (annData) setAnnouncements(annData);

      // Load Programs
      const { data: progData } = await supabase.from('programs').select('program_id, program_name').order('program_name', { ascending: true });
      if (progData) setPrograms(progData);
    }
    loadData();
  }, []);

  const getProgramColor = (index: number) => {
    const colors = ["primary", "tertiary", "secondary"];
    return colors[index % colors.length];
  };

  return (
    <div className="p-6 md:p-8 flex flex-col gap-8 w-full">
      <DashboardNotifications />
      {/* Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h2 className="font-display text-4xl text-on-surface font-bold">
              {greeting}, {formatTeacherName(user?.first_name, user?.last_name, 'Admin')}
           </h2>
           <p className="font-body text-lg text-on-surface-variant mt-2">Here is what's happening at your school today.</p>
        </div>
      </section>

      {/* Summary Cards Bento */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
        <StatCard icon={Users} label="Total Students" value={stats.totalStudents} colorClass="text-primary" />
        <StatCard icon={BookOpen} label="Active Classes" value={stats.activeClasses} colorClass="text-primary" />
        <StatCard icon={ClipboardCheck} label="Absences Today" value={stats.absencesToday} colorClass="text-error" opacity="opacity-50 grayscale" title="Data coming soon" />
        <StatCard icon={Coins} label="Tuition Paid" value="--" colorClass="text-tertiary" opacity="opacity-50 grayscale" title="Data coming soon" />
        <StatCard icon={UserCheck} label="Teacher Attendance" value="--" colorClass="text-tertiary" opacity="opacity-50 grayscale" title="Data coming soon" />
        <StatCard icon={UserPlus} label="New Registration" value="--" colorClass="text-secondary-container" bgClass="bg-surface-container-high" opacity="opacity-50 grayscale" title="Data coming soon" />
      </section>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Charts Area */}
          <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/30 shadow-[0_8px_20px_rgba(212,175,55,0.05)] h-96 flex flex-col relative overflow-hidden opacity-50 grayscale" title="Data coming soon">
             <div className="absolute inset-0 bg-surface/20 z-10"></div>
             <h3 className="font-title text-xl text-on-surface mb-6">Weekly Enrollment Trend</h3>
             <div className="flex-1 w-full min-h-0 pointer-events-none">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={data}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d0c5af" opacity={0.5} />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#7f7663', fontSize: 12, fontFamily: 'Plus Jakarta Sans' }} dy={10} />
                   <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7f7663', fontSize: 12 }} dx={-10} />
                   <Tooltip 
                      cursor={{fill: 'rgba(212,175,55,0.05)'}}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                   />
                   <Bar dataKey="students" fill="#d4af37" radius={[6, 6, 0, 0]} maxBarSize={48} />
                 </BarChart>
               </ResponsiveContainer>
             </div>
          </div>

          {/* Active Programs Overview */}
           <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/30 shadow-[0_8px_20px_rgba(212,175,55,0.05)]">
            <h3 className="font-title text-xl text-primary mb-6 border-b border-surface-variant pb-4">Active Programs Overview</h3>
            <div className="flex flex-col gap-4">
              {programs.length > 0 ? (
                programs.map((prog, idx) => (
                  <ProgramRow key={prog.program_id} name={prog.program_name} type={`${prog.school_year_or_term || 'Ongoing'} • ${prog.status || 'Active'}`} students="-" color={getProgramColor(idx)} />
                ))
              ) : (
                <div className="text-on-surface-variant text-sm py-4">No active programs found.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className="flex flex-col gap-8">
           {/* Announcements */}
           <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/30 shadow-[0_8px_20px_rgba(212,175,55,0.05)] flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-surface-variant pb-4">
                <h3 className="font-title text-xl text-primary flex items-center gap-3">
                  <Megaphone className="w-5 h-5" /> 
                  Announcements
                </h3>
                <button onClick={() => navigate("/admin/announcements")} className="font-label text-sm text-primary hover:underline font-bold">New Post</button>
              </div>
              <div className="flex flex-col gap-4">
                 {announcements.length > 0 ? (
                   announcements.map((ann) => (
                     <div key={ann.announcement_id} className="p-4 rounded-xl border border-outline-variant/30 bg-surface-container-low">
                        <div className="flex justify-between items-start mb-2">
                           <h4 className="font-label font-bold text-on-surface">{ann.title}</h4>
                        </div>
                        <p className="font-body text-sm text-on-surface-variant line-clamp-2">
                           {extractPlainText(ann.content)}
                        </p>
                     </div>
                   ))
                 ) : (
                    <div className="text-on-surface-variant text-sm">No announcements available.</div>
                 )}
              </div>
           </div>

           {/* Teacher Alerts */}
           <div className="bg-error-container/30 rounded-3xl p-6 border border-error/10 opacity-50 grayscale transition-opacity">
              <h3 className="font-title text-lg text-on-error-container mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 fill-error text-surface" />
                Teacher Alerts (Coming Soon)
              </h3>
              <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/20">
                <p className="font-body text-on-surface leading-relaxed">
                  <span className="font-bold">Substitution needed:</span> Grade 4 Math (Mr. Chen - Sick Leave)
                </p>
                <button className="mt-4 text-error font-label text-sm font-bold opacity-50 cursor-not-allowed">Assign Sub</button>
              </div>
           </div>

           {/* Quick Actions */}
           <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/30">
              <h3 className="font-title text-xl text-primary mb-6">Quick Actions</h3>
              <div className="flex flex-col gap-4">
                <QuickActionButton onClick={() => navigate("/admin/announcements")} icon={Megaphone} label="Send Announcement" variant="primary" />
                <QuickActionButton icon={CheckCircle2} label="Approve Class Changes" disabled={true} />
                <QuickActionButton icon={FileText} label="Review Reports" variant="outline" />
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, colorClass, bgClass = "bg-surface-container-lowest", opacity = "opacity-100", title }: any) {
  const isPending = value === "Pending";
  return (
    <div className={`${bgClass} ${opacity} rounded-2xl p-6 border border-outline-variant/30 shadow-[0_4px_10px_rgba(212,175,55,0.04)] flex flex-col gap-2 relative overflow-hidden group`} title={title}>
      <div className={`absolute -right-4 -top-4 opacity-[0.08] group-hover:scale-110 transition-transform duration-500 ${colorClass}`}>
        <Icon className="w-24 h-24" />
      </div>
      <p className="font-label text-sm text-outline z-10">{label}</p>
      <p className={`font-display ${isPending ? 'text-2xl mt-4' : 'text-4xl mt-2'} font-bold z-10 ${colorClass}`}>{value}</p>
    </div>
  );
}

function ProgramRow({ name, type, students, color }: any) {
  const bgColors: any = {
    primary: "bg-primary-container/20 text-primary border-primary/20",
    secondary: "bg-secondary-container/20 text-secondary border-secondary/20",
    tertiary: "bg-tertiary-container/20 text-tertiary border-tertiary/20"
  };
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-surface-container-low transition-colors group border border-transparent hover:border-outline-variant/20">
      <div className="flex items-start gap-4">
         <div className={`p-3 rounded-2xl flex items-center justify-center border ${bgColors[color]}`}>
            <BookOpen className="w-6 h-6" />
         </div>
         <div>
            <h4 className="font-body text-lg font-bold text-on-surface group-hover:text-primary transition-colors">{name}</h4>
            <p className="font-caption text-sm text-on-surface-variant mt-1">{type}</p>
         </div>
      </div>
      <div className="text-right">
         <p className="font-display text-xl font-bold text-on-surface">{students}</p>
         <p className="font-caption text-xs text-outline mt-0.5 uppercase tracking-wider">Enrolled</p>
      </div>
    </div>
  );
}

function QuickActionButton({ icon: Icon, label, variant, onClick, disabled }: any) {
  const base = "w-full font-label text-sm py-3.5 px-5 rounded-full flex items-center justify-center gap-3 transition-all";
  const variants: any = {
    primary: "bg-primary-container text-on-primary-container hover:bg-primary-container/90 shadow-sm",
    tertiary: "border-2 border-tertiary text-tertiary hover:bg-tertiary/10",
    outline: "border-2 border-outline-variant text-on-surface-variant hover:bg-surface-variant/50",
    disabled: "border border-outline-variant text-on-surface-variant/50 bg-surface-variant/30 cursor-not-allowed opacity-50 grayscale"
  };
  
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${disabled ? variants.disabled : variants[variant]}`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
