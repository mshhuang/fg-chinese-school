import { Users, BookOpen, ClipboardCheck, Coins, UserCheck, UserPlus, Megaphone, CheckCircle2, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: 'Mon', students: 500 },
  { name: 'Tue', students: 512 },
  { name: 'Wed', students: 518 },
  { name: 'Thu', students: 530 },
  { name: 'Fri', students: 542 },
];

export default function PrincipalDashboard() {
  return (
    <div className="p-6 md:p-8 flex flex-col gap-8 w-full">
      {/* Summary Cards Bento */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
        <StatCard icon={Users} label="Total Students" value="542" colorClass="text-primary" />
        <StatCard icon={BookOpen} label="Active Classes" value="32" colorClass="text-primary" />
        <StatCard icon={ClipboardCheck} label="Attendance Today" value="96%" colorClass="text-tertiary" />
        <StatCard icon={Coins} label="Tuition Paid" value="88%" colorClass="text-tertiary" />
        <StatCard icon={UserCheck} label="Teacher Attendance" value="100%" colorClass="text-tertiary" />
        <StatCard icon={UserPlus} label="New Registration" value="12" colorClass="text-secondary-container" bgClass="bg-surface-container-high" />
      </section>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Charts Area */}
          <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/30 shadow-[0_8px_20px_rgba(212,175,55,0.05)] h-96 flex flex-col relative overflow-hidden">
             <h3 className="font-title text-xl text-on-surface mb-6">Weekly Enrollment Trend</h3>
             <div className="flex-1 w-full min-h-0">
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
              <ProgramRow name="Chinese School" type="In-person & Online • Kids & Adults" students={320} color="primary" />
              <ProgramRow name="Summer Camp" type="Seasonal • Kids" students={150} color="tertiary" />
              <ProgramRow name="Singing Class" type="Weekend • All Ages" students={45} color="secondary" />
              <ProgramRow name="AP Classes" type="Advanced Placement • High School" students={85} color="primary" />
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
                <button className="font-label text-sm text-primary hover:underline font-bold">New Post</button>
              </div>
              <div className="flex flex-col gap-4">
                 <div className="p-4 rounded-xl border border-outline-variant/30 bg-surface-container-low">
                    <div className="flex justify-between items-start mb-2">
                       <h4 className="font-label font-bold text-on-surface">Spring Festival Gala</h4>
                       <span className="font-caption text-[10px] uppercase tracking-wide text-on-surface-variant">2h ago</span>
                    </div>
                    <p className="font-body text-sm text-on-surface-variant line-clamp-2">Rehearsals begin next week. All students in the singing program must attend.</p>
                 </div>
                 <div className="p-4 rounded-xl border border-outline-variant/30 bg-surface-container-low">
                    <div className="flex justify-between items-start mb-2">
                       <h4 className="font-label font-bold text-on-surface">Summer Camp Spots</h4>
                       <span className="font-caption text-[10px] uppercase tracking-wide text-on-surface-variant">1d ago</span>
                    </div>
                    <p className="font-body text-sm text-on-surface-variant line-clamp-2">Only 10 spots left in Session 1. Remind parents to register early.</p>
                 </div>
              </div>
           </div>

           {/* Teacher Alerts */}
           <div className="bg-error-container/30 rounded-3xl p-6 border border-error/10">
              <h3 className="font-title text-lg text-on-error-container mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 fill-error text-surface" />
                Teacher Alerts
              </h3>
              <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/20">
                <p className="font-body text-on-surface leading-relaxed">
                  <span className="font-bold">Substitution needed:</span> Grade 4 Math (Mr. Chen - Sick Leave)
                </p>
                <button className="mt-4 text-error font-label text-sm hover:underline font-bold">Assign Sub</button>
              </div>
           </div>

           {/* Quick Actions */}
           <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/30">
              <h3 className="font-title text-xl text-primary mb-6">Quick Actions</h3>
              <div className="flex flex-col gap-4">
                <QuickActionButton icon={Megaphone} label="Send Announcement" variant="primary" />
                <QuickActionButton icon={CheckCircle2} label="Approve Class Changes" variant="tertiary" />
                <QuickActionButton icon={FileText} label="Review Reports" variant="outline" />
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, colorClass, bgClass = "bg-surface-container-lowest" }: any) {
  return (
    <div className={`${bgClass} rounded-2xl p-6 border border-outline-variant/30 shadow-[0_4px_10px_rgba(212,175,55,0.04)] flex flex-col gap-2 relative overflow-hidden group`}>
      <div className={`absolute -right-4 -top-4 opacity-[0.08] group-hover:scale-110 transition-transform duration-500 ${colorClass}`}>
        <Icon className="w-24 h-24" />
      </div>
      <p className="font-label text-sm text-outline z-10">{label}</p>
      <p className={`font-display text-4xl font-bold mt-2 z-10 ${colorClass}`}>{value}</p>
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

import { AlertTriangle } from "lucide-react";

function QuickActionButton({ icon: Icon, label, variant }: any) {
  const base = "w-full font-label text-sm py-3.5 px-5 rounded-full flex items-center justify-center gap-3 transition-all";
  const variants: any = {
    primary: "bg-primary-container text-on-primary-container hover:bg-primary-container/90 shadow-sm",
    tertiary: "border-2 border-tertiary text-tertiary hover:bg-tertiary/10",
    outline: "border-2 border-outline-variant text-on-surface-variant hover:bg-surface-variant/50"
  };
  
  return (
    <button className={`${base} ${variants[variant]}`}>
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
