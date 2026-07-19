import { Clock, CheckCircle2, Bookmark, Users, Flame, Calendar, PlusCircle, ArrowRight, BookOpen, Megaphone, ClipboardEdit, FileText, AlertCircle } from "lucide-react";
import { cn, formatTeacherName, extractPlainText } from "../lib/utils";
import { fetchVisibleAnnouncements } from "../lib/announcementUtils";
import { supabase } from "../lib/supabase";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardNotifications } from "../components/DashboardNotifications";
import { QRCodeBadge } from "../components/QRCodeBadge";
import { QrCode } from "lucide-react";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [latestAnnouncement, setLatestAnnouncement] = useState<any>(null);
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [greeting, setGreeting] = useState("Good morning");
  const [assignedClasses, setAssignedClasses] = useState<any[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, any>>({});
  const [clockStatus, setClockStatus] = useState<'clocked_in' | 'clocked_out' | 'loading'>('loading');
  const [showQrCode, setShowQrCode] = useState(false);
  const [studentCheckInCount, setStudentCheckInCount] = useState(0);
  const [totalStudentsCount, setTotalStudentsCount] = useState(0);
  const [clockModalState, setClockModalState] = useState<'closed' | 'in_initial' | 'in_no' | 'in_success' | 'out_initial' | 'out_no' | 'out_success'>('closed');
  const [clockModalReason, setClockModalReason] = useState('');

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    let currentUser = null;
    if (userJson) {
       try {
           currentUser = JSON.parse(userJson);
           setUser(currentUser);
       } catch(e) {}
    }
    
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    fetchLatestAnnouncement();
    fetchRecentSubmissions(currentUser);
    if (currentUser) {
       fetchAssignedClasses(currentUser.id);
       fetchClockStatus(currentUser);
    }
  }, []);
  
  
  const fetchClockStatus = async (currentUser: any) => {
    if (!currentUser || currentUser.id === 'demo') {
       setClockStatus('clocked_out');
       return;
    }
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    const { data } = await supabase
       .from('staff_clock_ins')
       .select('*')
       .eq('user_id', currentUser.id)
       .gte('created_at', startOfDay.toISOString())
       .order('created_at', { ascending: false })
       .limit(1);
    
    if (data && data.length > 0) {
       setClockStatus(data[0].action_type === 'clock_in' ? 'clocked_in' : 'clocked_out');
    } else {
       setClockStatus('clocked_out');
    }
  };

  const handleClockButtonClicked = () => {
    if (!user || (user?.user_id || user?.id) === 'demo') return;
    setClockModalReason('');
    if (clockStatus === 'clocked_in') {
       setClockModalState('out_initial');
    } else {
       setClockModalState('in_initial');
    }
  };

  const processClockIn = async (reason: string) => {
    if (clockStatus === 'loading') return;
    setClockStatus('loading');
    const { error } = await supabase.from('staff_clock_ins').insert({
       user_id: (user?.user_id || user?.id),
       action_type: 'clock_in',
       daily_status: reason
    });
    if (error) console.error("Error clocking in:", error);
    setClockStatus('clocked_in');
    setClockModalState('in_success');
  };

  const processClockOut = async (reason: string) => {
    if (clockStatus === 'loading') return;
    setClockStatus('loading');
    const { error } = await supabase.from('staff_clock_ins').insert({
       user_id: (user?.user_id || user?.id),
       action_type: 'clock_out',
       daily_status: reason
    });
    if (error) console.error("Error clocking out:", error);
    setClockStatus('clocked_out');
    setClockModalState('out_success');
  };

  
  const fetchAssignedClasses = async (teacherId: string) => {
     if (teacherId === 'demo') return;
     const { data: userData } = await supabase.from('users').select('user_id, first_name, last_name, user_roles(roles(role_name))');
     const uMap: Record<string, any> = {};
     if (userData) {
        userData.forEach((u: any) => {
           const isVolunteer = u.user_roles?.some((ur: any) => ur.roles?.role_name === 'Volunteer');
           uMap[u.user_id] = { ...u, isVolunteer };
        });
        setUsersMap(uMap);
     }
     
     const { data } = await supabase.from('classes').select('*, users:primary_teacher_id(first_name, last_name), co_teacher:co_teacher_id(first_name, last_name), co_teachers');
     if (data) {
        data.sort((a, b) => {
           if (a.primary_teacher_id === teacherId && b.primary_teacher_id !== teacherId) return -1;
           if (b.primary_teacher_id === teacherId && a.primary_teacher_id !== teacherId) return 1;
           return 0;
        });
        const myClasses = data.filter(c => c.primary_teacher_id === teacherId || c.co_teacher_id === teacherId || (c.co_teachers || []).includes(teacherId));
        setAssignedClasses(myClasses);
        
        // Fetch total enrolled students for these classes
        if (myClasses.length > 0) {
            const classIds = myClasses.map(c => c.class_id);
            const { data: enrollments } = await supabase.from('enrollments').select('student_id').in('class_id', classIds);
            
            if (enrollments) {
                const uniqueStudents = [...new Set(enrollments.map(e => e.student_id))];
                setTotalStudentsCount(uniqueStudents.length);
                
                // Fetch check-ins for these students today
                const startOfDay = new Date();
                startOfDay.setHours(0,0,0,0);
                const { data: logs } = await supabase
                   .from('system_logs')
                   .select('user_id')
                   .eq('action_type', 'school_check_in')
                   .gte('created_at', startOfDay.toISOString());
                
                if (logs) {
                   const checkedInStudents = logs.filter(log => uniqueStudents.includes(log.user_id));
                   const uniqueCheckedIn = [...new Set(checkedInStudents.map(l => l.user_id))];
                   setStudentCheckInCount(uniqueCheckedIn.length);
                }
            }
        }
     }
  };

  const fetchRecentSubmissions = async (currentUser: any) => {
    try {
      let authorId = null;
      if (currentUser) {
         authorId = currentUser.id;
         if (authorId === 'demo') {
             authorId = 'c4d458f8-ba08-4fc1-bbbf-c4c1eac64068'; // fallback
         }
      }
      
      let query = supabase.from('newsletters').select('newsletter_id, title, content, created_at, is_published, author_id').order('newsletter_id', { ascending: false }).limit(3);
      if (authorId) {
          query = query.eq('author_id', authorId);
      }
      
      const { data, error } = await query;
      if (data) {
        const parsed = data.map((item: any) => {
           const formattedDate = item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { timeZone: 'America/New_York', month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown Date';
           try {
             return { id: item.newsletter_id, title: item.title, author: item.author_id, ...JSON.parse(item.content || "{}"), date: formattedDate };
           } catch {
             return { id: item.newsletter_id, title: item.title, content: item.content, status: "Published", date: formattedDate };
           }
        });
        setRecentSubmissions(parsed);
      }
    } catch (e) {
      console.error(e);
    }
  };

      const fetchLatestAnnouncement = async () => {
    const anns = await fetchVisibleAnnouncements(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : user, localStorage.getItem('current_role') || 'teacher', 1);
    if (anns && anns.length > 0) {
       setLatestAnnouncement(anns[0]);
    } else {
       setLatestAnnouncement(null);
    }
  };

  return (
    <div className="p-6 md:p-8 w-full pb-32 md:pb-8 relative h-full min-h-[80vh]">
      {/* Active Header part */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 relative z-10">
        <div>
           <h2 className="font-display text-4xl text-on-surface font-bold">
              {greeting}, {formatTeacherName(user?.first_name, user?.last_name, 'Teacher')}
           </h2>
           <p className="font-body text-lg text-on-surface-variant mt-2">You have {assignedClasses.filter(c => c.primary_teacher_id === (user?.user_id || user?.id)).length} homeroom classes and {assignedClasses.filter(c => c.primary_teacher_id !== (user?.user_id || user?.id)).length} co-teacher classes.</p>
        </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
            <button onClick={() => setShowQrCode(true)} className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-label font-bold transition-colors shadow-sm bg-primary-container text-on-primary-container hover:bg-primary-container/80">
               <QrCode className="w-5 h-5" /> 
               Teacher ID Badge
            </button>
            <button onClick={() => navigate('/teacher/scanner')} className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-label font-bold transition-colors shadow-sm bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80">
               <CheckCircle2 className="w-5 h-5" /> 
               QR Scanner
            </button>
            <button 
                onClick={handleClockButtonClicked}
                disabled={clockStatus === 'loading'}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-full font-label font-bold transition-colors shadow-sm disabled:opacity-50 ${
                    clockStatus === 'clocked_in' 
                       ? 'bg-error-container text-on-error-container hover:bg-error-container/90 border border-error/20' 
                       : 'bg-primary text-on-primary hover:bg-primary/90'
                }`}
            >
               <Clock className="w-5 h-5 fill-current opacity-80" /> 
               {clockStatus === 'loading' ? 'Loading...' : clockStatus === 'clocked_in' ? 'Clock Out' : 'Clock In'}
            </button>
        </div>
      </section>

      {/* Overlay for grayed out parts */}
      

      <div className="flex flex-col gap-8">
        {/* Rest of the original header buttons */}
        <section className="flex flex-col md:flex-row justify-end items-start md:items-center gap-6 -mt-4 mb-4">
          <div className="flex gap-4 w-full md:w-auto">
          </div>
        </section>

        <DashboardNotifications />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Left Column */}
          <div className="md:col-span-12 flex flex-col gap-8">
             {/* My Programs */}
             <div className="bg-surface-container-lowest rounded-3xl border border-surface-variant p-8 shadow-[0_4px_20px_rgba(212,175,55,0.05)] flex flex-col gap-6">
               <h3 className="font-title text-xl text-on-surface flex items-center gap-3 font-bold">
                  <BookOpen className="text-primary w-6 h-6" />
                  Assigned Programs
               </h3>
               <div className="flex flex-col gap-3">
                  {assignedClasses.length > 0 ? assignedClasses.map(cls => (
                     <div key={cls.class_id} className="flex flex-col gap-2 p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
                        <div className="flex items-center justify-between">
                           <div>
                              <h4 className="font-label font-bold text-on-surface">{cls.class_name || cls.name || 'Unnamed Class'}</h4>
                              <p className="font-caption text-xs text-on-surface-variant mt-1">2026 Summer Camp</p>
                           </div>
                           <span className={cn(
                              "px-3 py-1 rounded-full font-label text-xs font-bold whitespace-nowrap",
                              cls.primary_teacher_id === (user?.user_id || user?.id) 
                                 ? "bg-primary-container/20 text-primary" 
                                 : "bg-secondary-container/20 text-secondary"
                           )}>
                              {cls.primary_teacher_id === (user?.user_id || user?.id) ? "Homeroom Teacher" : "Co-Teacher"}
                           </span>
                        </div>
                        <div className="flex flex-wrap gap-4 mt-2 pt-2 border-t border-outline-variant/20">
                           <div className="text-xs">
                              <span className="font-bold text-on-surface-variant">Homeroom: </span>
                              <span className="text-on-surface">{formatTeacherName(cls.users?.first_name, cls.users?.last_name, 'Teacher')}</span>
                           </div>
                           <div className="text-xs">
                              <span className="font-bold text-on-surface-variant">Co-Teacher: </span>
                              <span className="text-on-surface">
                                 {(() => {
                                 const currentUserId = user?.user_id || user?.id;
                                 const allCoTeachers = [
                                    ...(cls.co_teacher_id && !(cls.co_teachers || []).includes(cls.co_teacher_id) ? [cls.co_teacher_id] : []),
                                    ...(cls.co_teachers || [])
                                 ];
                                 if (allCoTeachers.length === 0) return 'TBD';
                                 
                                 return allCoTeachers.map(id => {
                                    if (id === currentUserId) return `You (${formatTeacherName(user?.first_name, user?.last_name, 'Teacher')})`;
                                    const u = usersMap[id];
                                    if (!u) return 'Unknown';
                                    if (u.isVolunteer) return `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Volunteer';
                                    return formatTeacherName(u.first_name, u.last_name, 'Teacher');
                                 }).join(', ');
                               })()}
                              </span>
                           </div>
                        </div>
                     </div>
                  )) : (
                     <p className="text-sm text-on-surface-variant italic">No classes assigned yet.</p>
                  )}
               </div>
            </div>

             <div className="bg-surface-container-lowest rounded-3xl border border-surface-variant p-8 shadow-[0_4px_20px_rgba(212,175,55,0.05)] relative overflow-hidden opacity-50 grayscale pointer-events-none">
                 <div className="flex justify-between items-center z-10 relative mb-8 border-b border-surface-variant pb-4">
                    <h3 className="font-title text-xl text-on-surface flex items-center gap-3 font-bold">
                       <Calendar className="text-primary w-6 h-6" />
                       Today's Schedule
                    </h3>
                    <span className="font-caption text-sm text-on-surface-variant font-bold">
                       {new Date().toLocaleDateString('en-US', { timeZone: 'America/New_York',  weekday: 'long', month: 'short', day: 'numeric' })}
                    </span>
                 </div>
                 
                 <div className="space-y-4">
                   <ScheduleItem time="08:30 AM" end="10:00 AM" title="Morning Check-in" location="Main Hall" current />
                   <ScheduleItem block time="11:45 AM" end="12:30 PM" title="Lunch Break" location="Staff Room" />
                 </div>
             </div>
          </div>
          
       </div>
    </div>

      {/* Clock In/Out Modals */}
      {clockModalState !== 'closed' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            
            {clockModalState === 'in_initial' && (
              <div className="flex flex-col gap-6">
                <h3 className="font-display text-2xl text-on-surface font-bold text-center">
                  Dear teacher, are you check in from school building?
                </h3>
                <div className="flex gap-4">
                  <button 
                    onClick={() => processClockIn('check-in the building')}
                    className="flex-1 bg-primary text-on-primary py-3 rounded-xl font-label font-bold"
                  >
                    Yes
                  </button>
                  <button 
                    onClick={() => setClockModalState('in_no')}
                    className="flex-1 bg-error-container text-on-error-container py-3 rounded-xl font-label font-bold"
                  >
                    No
                  </button>
                </div>
                <button 
                  onClick={() => setClockModalState('closed')}
                  className="absolute top-4 right-4 text-on-surface-variant"
                >
                  ✕
                </button>
              </div>
            )}

            {clockModalState === 'in_no' && (
              <div className="flex flex-col gap-6">
                <h3 className="font-display text-xl text-on-surface font-bold">
                  Please explain why not check in from school building:
                </h3>
                <textarea 
                  className="w-full bg-surface-container-highest border-none rounded-xl p-4 text-on-surface resize-none focus:ring-2 focus:ring-primary outline-none"
                  rows={4}
                  value={clockModalReason}
                  onChange={(e) => setClockModalReason(e.target.value)}
                  placeholder="Enter reason..."
                />
                <button 
                  onClick={() => processClockIn(clockModalReason || 'Not in building')}
                  className="w-full bg-primary text-on-primary py-3 rounded-xl font-label font-bold"
                >
                  Confirm
                </button>
                <button 
                  onClick={() => setClockModalState('closed')}
                  className="absolute top-4 right-4 text-on-surface-variant"
                >
                  ✕
                </button>
              </div>
            )}

            {clockModalState === 'in_success' && (
              <div className="flex flex-col gap-6 items-center text-center">
                <div className="w-16 h-16 bg-primary-container text-primary rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-display text-2xl text-on-surface font-bold">
                  Welcome, Teacher! Have a fantastic day!
                </h3>
                <button 
                  onClick={() => setClockModalState('closed')}
                  className="w-full bg-primary text-on-primary py-3 rounded-xl font-label font-bold"
                >
                  Done
                </button>
              </div>
            )}

            {clockModalState === 'out_initial' && (
              <div className="flex flex-col gap-6">
                <h3 className="font-display text-2xl text-on-surface font-bold text-center">
                  Dear teacher, are you check out from school building?
                </h3>
                <div className="flex gap-4">
                  <button 
                    onClick={() => processClockOut('classes over')}
                    className="flex-1 bg-primary text-on-primary py-3 rounded-xl font-label font-bold"
                  >
                    Yes
                  </button>
                  <button 
                    onClick={() => setClockModalState('out_no')}
                    className="flex-1 bg-error-container text-on-error-container py-3 rounded-xl font-label font-bold"
                  >
                    No
                  </button>
                </div>
                <button 
                  onClick={() => setClockModalState('closed')}
                  className="absolute top-4 right-4 text-on-surface-variant"
                >
                  ✕
                </button>
              </div>
            )}

            {clockModalState === 'out_no' && (
              <div className="flex flex-col gap-6">
                <h3 className="font-display text-xl text-on-surface font-bold">
                  Please explain why not check out from school building:
                </h3>
                <textarea 
                  className="w-full bg-surface-container-highest border-none rounded-xl p-4 text-on-surface resize-none focus:ring-2 focus:ring-primary outline-none"
                  rows={4}
                  value={clockModalReason}
                  onChange={(e) => setClockModalReason(e.target.value)}
                  placeholder="Enter reason..."
                />
                <button 
                  onClick={() => processClockOut(clockModalReason || 'Not in building')}
                  className="w-full bg-primary text-on-primary py-3 rounded-xl font-label font-bold"
                >
                  Confirm
                </button>
                <button 
                  onClick={() => setClockModalState('closed')}
                  className="absolute top-4 right-4 text-on-surface-variant"
                >
                  ✕
                </button>
              </div>
            )}

            {clockModalState === 'out_success' && (
              <div className="flex flex-col gap-6 items-center text-center">
                <div className="w-16 h-16 bg-primary-container text-primary rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-display text-2xl text-on-surface font-bold">
                  Thank you for all you do. Have a wonderful evening!
                </h3>
                <button 
                  onClick={() => setClockModalState('closed')}
                  className="w-full bg-primary text-on-primary py-3 rounded-xl font-label font-bold"
                >
                  Done
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {showQrCode && user && (
         <QRCodeBadge 
            studentId={(user?.user_id || user?.id)} 
            studentName={formatTeacherName(user?.first_name, user?.last_name, 'Teacher')} 
            onClose={() => setShowQrCode(false)} 
            title="Teacher ID Badge"
         />
      )}

  </div>
  );
}

function ScheduleItem({ time, end, title, location, current }: any) {
  return (
    <div className={cn(
      "flex gap-4 p-4 rounded-2xl border transition-all",
      current 
        ? "bg-primary-container/10 border-primary-container shadow-sm" 
        : "bg-surface border-transparent hover:border-outline-variant/50"
    )}>
       <div className="shrink-0 w-20 flex flex-col items-end gap-1">
         <span className={cn("font-label text-sm font-bold", current ? "text-primary" : "text-on-surface")}>{time}</span>
         <span className="font-caption text-xs text-on-surface-variant">{end}</span>
       </div>
       
       <div className={cn("w-1 rounded-full", current ? "bg-primary" : "bg-surface-variant")}></div>
       
       <div className="flex-1 flex flex-col justify-center">
         <h4 className={cn("font-label font-bold text-base", current ? "text-on-surface" : "text-on-surface-variant")}>{title}</h4>
         <p className="font-caption text-sm text-on-surface-variant mt-1">{location}</p>
       </div>
    </div>
  );
}

function SubmissionItem({ title, status, date }: any) {
  const getStatusColor = () => {
    switch(status) {
      case 'pending': return 'bg-tertiary-container/30 text-tertiary';
      case 'approved': return 'bg-secondary-container/30 text-secondary';
      case 'changes': return 'bg-error-container/30 text-error';
      default: return 'bg-surface-variant text-on-surface-variant';
    }
  };
  
  const getStatusLabel = () => {
    switch(status) {
      case 'pending': return 'Pending Review';
      case 'approved': return 'Approved';
      case 'changes': return 'Needs Changes';
      default: return status;
    }
  };

  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 hover:border-outline-variant/50 transition-colors">
       <div className="flex justify-between items-start gap-4">
         <h4 className="font-label text-sm font-bold text-on-surface line-clamp-1">{title}</h4>
         <span className={cn("font-caption text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm font-bold shrink-0", getStatusColor())}>
           {getStatusLabel()}
         </span>
       </div>
       <span className="font-caption text-xs text-on-surface-variant">{date}</span>
    </div>
  );
}
