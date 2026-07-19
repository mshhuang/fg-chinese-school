import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Check, Volume2, Star, Edit3, Lock, ChevronRight, Megaphone, Users, Circle } from "lucide-react";
import { cn } from "../lib/utils";
import { fetchVisibleAnnouncements } from "../lib/announcementUtils";
import { supabase } from "../lib/supabase";
import { DashboardNotifications } from "../components/DashboardNotifications";
import { QRCodeBadge } from "../components/QRCodeBadge";
import { QrCode, CheckCircle2 } from "lucide-react";

export default function StudentPortal() {
  const [userName, setUserName] = useState("");
  const [showQrCode, setShowQrCode] = useState(false);
  const [userId, setUserId] = useState("");
  const [checkInStatus, setCheckInStatus] = useState<'checked_in' | 'checked_out' | 'not_checked_in' | 'loading'>('loading');
  const [checkInTime, setCheckInTime] = useState("");
  const [programDays, setProgramDays] = useState(0);
  const [parents, setParents] = useState<any[]>([]);
  const [announcement, setAnnouncement] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);

  const [myPrograms, setMyPrograms] = useState<any[]>([]);

  useEffect(() => {
    async function fetchStudentData() {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user && user.first_name) {
            setUserName(user.first_name);
            setUserId(user.id);
            fetchCheckInStatus(user.id);
          }

          if (user && user.id && user.id !== 'demo') {
            const { data } = await supabase
              .from('parent_child')
              .select(`
                parent_id,
                relationship_type,
                users:parent_id (
                  first_name,
                  last_name
                )
              `)
              .eq('child_id', user.id) as any;

            if (data) {
                const parentsData = data.map((d: any) => ({
                    ...d.users,
                    relationship_type: d.relationship_type
                })).filter((u: any) => u && u.first_name);
                setParents(parentsData);
            }

            const { data: enrollmentsData } = await supabase
              .from('enrollments')
              .select(`
                enrollment_date,
                status,
                programs (
                  program_id,
                  program_name,
                  start_date
                )
              `)
              .eq('student_id', user.id);

            if (enrollmentsData && enrollmentsData.length > 0) {
               const validPrograms = enrollmentsData.filter((e: any) => e.programs).map((e: any) => ({
                  ...e.programs,
                  status: e.status
               }));
               
               // Deduplicate programs by program_id since a student might be enrolled in multiple classes in the same program
               const uniquePrograms = Array.from(new Map(validPrograms.map((p: any) => [p.program_id, p])).values()).map((p: any) => {
                  let days = 0;
                  if (p.start_date) {
                     const start = new Date(p.start_date);
                     const now = new Date();
                     const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                     days = diff >= 0 ? diff : 0;
                  }
                  return { ...p, days };
               });
               setMyPrograms(uniquePrograms);

               const totalDays = uniquePrograms.reduce((sum, p) => sum + (p.days || 0), 0);
               if (totalDays > 0) {
                 setProgramDays(totalDays);
               } else {
                 // Fallback if no start_date on active programs
                 const sortedEnrollments = [...enrollmentsData].filter(e => e.enrollment_date).sort((a: any, b: any) => new Date(a.enrollment_date).getTime() - new Date(b.enrollment_date).getTime());
                 if (sortedEnrollments.length > 0) {
                    const start = new Date(sortedEnrollments[0].enrollment_date);
                    const now = new Date();
                    const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                    setProgramDays(diff >= 0 ? diff : 0);
                 } else {
                    const { data: userData } = await supabase.from('users').select('created_at').eq('id', user.id).single();
                    if (userData?.created_at) {
                       const start = new Date(userData.created_at);
                       const now = new Date();
                       const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                       setProgramDays(diff >= 0 ? diff : 0);
                    }
                 }
               }
            } else {
               const { data: userData } = await supabase
                 .from('users')
                 .select('created_at')
                 .eq('id', user.id)
                 .single();
               if (userData?.created_at) {
                  const start = new Date(userData.created_at);
                  const now = new Date();
                  const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                  setProgramDays(diff >= 0 ? diff : 0);
               } else {
                  setProgramDays(0);
               }
            }

            // Fetch latest announcement
            const anns = await fetchVisibleAnnouncements(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : user, localStorage.getItem('current_role') || 'student', 1);
            if (anns && anns.length > 0) setAnnouncement(anns[0]);

            // Fetch assignments
            const { data: assignData } = await supabase
              .from('assignment_students')
              .select(`
                assignment_student_id,
                status,
                assignments (
                   title, type, due_date, description,
                   classes ( class_name )
                )
              `)
              .eq('student_id', user.id);
            if (assignData) {
               const pending = assignData.filter((a: any) => a.status === 'pending');
               setAssignments(pending);
            }

            // Fetch classes
            const { data: enrollData } = await supabase
              .from('enrollments')
              .select(`
                 classes (
                    class_id, class_name
                 )
              `)
              .eq('student_id', user.id);
            if (enrollData) {
               setClasses(enrollData.map((e: any) => e.classes).filter(Boolean));
            }
          }
        } catch (e) {
          console.error("Error parsing user from localStorage", e);
        }
      }
    }
    fetchStudentData();
  }, []);

  
  const fetchCheckInStatus = async (studentId: string) => {
     setCheckInStatus('loading');
     setCheckInTime('');
     const startOfDay = new Date();
     startOfDay.setHours(0,0,0,0);
     const { data } = await supabase
       .from('student_clock_ins')
       .select('*')
       .eq('student_id', studentId)
       .gte('created_at', startOfDay.toISOString())
       .order('created_at', { ascending: false })
       .limit(1);
     
          if (data && data.length > 0) {
        if (data[0].action_type === 'school_check_in') {
            setCheckInStatus('checked_in');
            setCheckInTime(data[0].created_at);
        } else if (data[0].action_type === 'school_check_out') {
            setCheckInStatus('checked_out');
        } else {
            setCheckInStatus('not_checked_in');
        }
     } else {
        setCheckInStatus('not_checked_in');
     }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-10 w-full pb-32 md:pb-8">
      <DashboardNotifications />
      {/* Welcome Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-surface-container border border-surface-variant p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 shadow-sm">
        <div className="absolute -right-8 -top-8 opacity-5 pointer-events-none">
           <div className="w-64 h-64 border-[40px] border-primary rounded-full"></div>
        </div>
        
        <div className="relative w-32 h-32 shrink-0 z-10">
          <img 
            src="https://images.unsplash.com/photo-1517673132405-a56a62b18caf?q=80&w=200&auto=format&fit=crop" 
            alt="Student avatar" 
            className="w-full h-full rounded-full border-4 border-primary-container object-cover"
          />
          <div className="absolute -bottom-2 -right-2 bg-secondary-container text-on-secondary px-3 py-1 rounded-full border-[3px] border-surface font-caption text-xs font-bold flex items-center gap-1 shadow-md">
            🔥 {programDays} Days
          </div>
        </div>
        
        <div className="flex-1 text-center md:text-left z-10">
          <h1 className="font-title text-2xl md:text-4xl text-primary font-bold mb-2">Welcome back, {userName}!</h1>
          <p className="font-body text-lg text-on-surface-variant mb-4">Your journey of knowledge continues. You're doing great!</p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
            <button onClick={() => setShowQrCode(true)} className="font-caption text-sm bg-primary-container hover:bg-primary-container/80 text-on-primary-container px-4 py-1.5 rounded-full flex items-center gap-2 transition-colors font-bold shadow-sm">
              <QrCode className="w-4 h-4" /> Student ID Badge
            </button>
            <span className={`font-caption text-sm px-4 py-1.5 rounded-full flex items-center gap-2 font-bold ${checkInStatus === 'checked_in' ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#2E7D32]/30' : checkInStatus === 'checked_out' ? 'bg-[#FFF3E0] text-[#E65100] border border-[#E65100]/30' : 'bg-surface-variant text-on-surface-variant border border-outline-variant/30'}`}>
              <CheckCircle2 className="w-4 h-4" /> {checkInStatus === 'loading' ? 'Loading...' : checkInStatus === 'checked_in' ? (() => {
                if (!checkInTime) return `${userName} is in the school`;
                const d = new Date(checkInTime);
                const timeStr = d.toLocaleTimeString('en-US', { timeZone: 'America/New_York',  hour: 'numeric', minute: '2-digit' , timeZoneName: 'short'});
                const dateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
                return `${userName} arrived at school at ${timeStr} on ${dateStr}`;
              })() : checkInStatus === 'checked_out' ? `${userName} is ready to go home` : 'Not Checked In'}
            </span>
          </div>

          
          {parents.length > 0 && (
             <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <Users className="w-4 h-4 text-on-surface-variant" />
                <span className="font-label text-sm font-bold text-on-surface-variant">Linked Family:</span>
                {parents.map((p, idx) => (
                    <span key={idx} className="font-body text-sm bg-surface-container-high px-2 py-1 rounded-md text-on-surface">
                       {p.first_name} {p.last_name} <span className="text-on-surface-variant text-xs opacity-70">({p.relationship_type || 'Parent'})</span>
                    </span>
                ))}
             </div>
          )}
        </div>
      </section>

      {/* Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* School Announcements */}
        {announcement && (
        <div className="lg:col-span-12 bg-primary-container/10 rounded-3xl border border-primary-container/30 p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6">
           <div className="w-12 h-12 md:w-16 md:h-16 bg-surface-container-lowest rounded-full flex items-center justify-center shrink-0 border-2 border-primary-container z-10 shadow-sm">
              <Megaphone className="w-5 h-5 md:w-8 md:h-8 text-primary opacity-80" />
           </div>
           
           <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                 <h3 className="font-label text-base text-on-surface font-bold">School Announcements</h3>
                 <span className="font-caption text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-sm uppercase tracking-wide font-bold">New</span>
              </div>
              <p className="font-body text-on-surface-variant text-sm">{announcement.title}</p>
           </div>
           
           <Link to="/student/announcements" className="font-label text-sm text-primary font-bold hover:underline shrink-0">
              Read More
           </Link>
        </div>
        )}

        {/* Main Column */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Today's Path */}
          <section className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-title text-xl text-on-surface flex items-center gap-3 font-bold">
                <BookOpen className="text-tertiary w-6 h-6" />
                Today's Path
              </h2>
              <span className="font-caption bg-tertiary-container/30 text-tertiary font-bold px-4 py-1.5 rounded-full border border-tertiary-container/50">{assignments.length} Tasks Left</span>
            </div>
            
            <div className="space-y-4">
              {assignments.length > 0 ? assignments.map((a: any) => (
                 <Link to="/student/assignments" key={a.assignment_student_id} className="flex items-center gap-4 p-5 rounded-2xl bg-surface-container-low border border-outline-variant/50 hover:bg-surface transition-all group cursor-pointer shadow-sm hover:shadow">
                    <button className="w-8 h-8 rounded-full border-2 border-outline flex items-center justify-center group-hover:border-primary transition-colors shrink-0"></button>
                    <div className="flex-1 min-w-0">
                       <h3 className="font-body text-lg font-bold text-on-surface truncate">{a.assignments?.title}</h3>
                       <p className="font-caption text-sm text-on-surface-variant mt-1.5">{a.assignments?.classes?.class_name} • {a.assignments?.due_date ? `Due ${new Date(a.assignments.due_date).toLocaleDateString('en-US', { timeZone: 'America/New_York' })}` : 'No due date'}</p>
                    </div>
                    <ChevronRight className="text-outline-variant group-hover:text-primary transition-colors w-6 h-6 shrink-0" />
                 </Link>
              )) : (
                 <div className="p-5 text-center text-on-surface-variant font-body border border-dashed border-outline-variant/50 rounded-2xl">
                    <p>All caught up!</p>
                 </div>
              )}
            </div>
          </section>



        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4 space-y-8">
           
           {/* My Programs */}
           <section className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-8 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <h2 className="font-title text-xl font-bold text-on-surface">My Programs</h2>
             </div>
             
             <div className="flex flex-col gap-3">
                {myPrograms.length > 0 ? myPrograms.map((prog, i) => (
                   <div key={i} className="flex flex-col gap-1.5 p-4 rounded-xl border bg-primary-container/10 border-primary-container/20">
                      <h4 className="font-label font-bold text-primary">{prog.program_name}</h4>
                      <div className="flex justify-between items-center">
                        <p className="font-caption text-xs text-on-surface-variant">{prog.status || 'Enrolled'}</p>
                        {prog.days !== undefined && (
                          <span className="text-xs font-bold text-primary flex items-center gap-1">🔥 {prog.days} Days</span>
                        )}
                      </div>
                   </div>
                )) : (
                   <div className="flex flex-col gap-1.5 p-4 rounded-xl border border-outline-variant/30">
                      <p className="font-caption text-xs text-on-surface-variant">No programs found.</p>
                   </div>
                )}
             </div>
           </section>

           {/* Achievements */}
           <section className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-8 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <h2 className="font-title text-xl font-bold text-on-surface">Achievements</h2>
                <button className="font-label text-sm text-primary hover:underline font-bold">View All</button>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <Badge icon={Star} label="Week Scholar" color="tertiary" />
                <Badge icon={Edit3} label="Calligraphy Pro" color="secondary" />
                <Badge icon={Lock} label="Math Master" active={false} />
                <Badge icon={Lock} label="Perfect Attend" active={false} />
             </div>
           </section>

           

        </div>
            </div>
      {showQrCode && userId && (
        <QRCodeBadge 
           studentId={userId} 
           studentName={userName} 
           onClose={() => setShowQrCode(false)} 
           title="Student ID Badge"
        />
     )}
    </div>
  );
}

function Badge({ icon: Icon, label, active = true, color }: any) {
  const colors: any = {
    tertiary: "bg-tertiary-container text-on-tertiary-container",
    secondary: "bg-secondary-container text-on-secondary-container",
    primary: "bg-primary-container text-on-primary-container"
  };

  return (
    <div className={cn(
      "flex flex-col items-center p-4 rounded-2xl border text-center transition-all",
      active ? "bg-surface-container-low border-surface-variant hover:border-outline-variant/50" : "bg-surface-container-lowest opacity-50 border-dashed border-outline-variant"
    )}>
      <div className={cn(
        "w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-sm",
        active && color ? colors[color] : "bg-surface-variant text-on-surface-variant"
      )}>
        <Icon className={cn("w-6 h-6", active ? "fill-current" : "")} />
      </div>
      <span className={cn("font-caption text-xs mt-2", active ? "font-bold text-on-surface" : "text-on-surface-variant")}>{label}</span>

    </div>
  );
}