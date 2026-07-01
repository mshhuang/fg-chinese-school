import { Clock, CheckCircle2, Bookmark, Flame, Calendar, PlusCircle, ArrowRight, BookOpen, Megaphone, ClipboardEdit, FileText } from "lucide-react";
import { cn, formatTeacherName } from "../lib/utils";
import { supabase } from "../lib/supabase";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardNotifications } from "../components/DashboardNotifications";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [latestAnnouncement, setLatestAnnouncement] = useState<any>(null);
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [greeting, setGreeting] = useState("Good morning");
  const [assignedClasses, setAssignedClasses] = useState<any[]>([]);

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
    }
  }, []);
  
  const fetchAssignedClasses = async (teacherId: string) => {
     if (teacherId === 'demo') return;
     const { data } = await supabase.from('classes').select('*, programs(program_name)').eq('primary_teacher_id', teacherId);
     if (data) setAssignedClasses(data);
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
      
      let query = supabase.from('newsletters').select('*').order('newsletter_id', { ascending: false }).limit(3);
      if (authorId) {
          query = query.eq('author_id', authorId);
      }
      
      const { data, error } = await query;
      if (data) {
        const parsed = data.map((item: any) => {
           try {
             return { id: item.newsletter_id, title: item.title, author: item.author_id, ...JSON.parse(item.content || "{}") };
           } catch {
             return { id: item.newsletter_id, title: item.title, content: item.content, status: "Published", date: "Unknown" };
           }
        });
        setRecentSubmissions(parsed);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLatestAnnouncement = async () => {
    const { data } = await supabase
       .from('announcements')
       .select('*')
       .order('created_at', { ascending: false })
       .limit(1);
    
    if (data && data.length > 0) {
       setLatestAnnouncement(data[0]);
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
           <p className="font-body text-lg text-on-surface-variant mt-2">You have {assignedClasses.length} active classes.</p>
        </div>
      </section>

      {/* Overlay for grayed out parts */}
      <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none top-32">
         <div className="bg-surface/80 backdrop-blur-md border border-outline-variant/30 px-8 py-6 rounded-3xl shadow-2xl text-center pointer-events-auto">
            <h2 className="font-display text-3xl font-bold text-on-surface mb-2">Coming Soon</h2>
            <p className="font-body text-on-surface-variant text-lg">The teacher dashboard is currently under construction.</p>
         </div>
      </div>

      <div className="flex flex-col gap-8 opacity-30 grayscale pointer-events-none select-none">
        {/* Rest of the original header buttons */}
        <section className="flex flex-col md:flex-row justify-end items-start md:items-center gap-6 -mt-24 mb-8">
          <div className="flex gap-4 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary-container text-on-primary-container px-6 py-3 rounded-full font-label font-bold hover:bg-primary-container/90 transition-colors shadow-sm">
               <PlusCircle className="w-5 h-5 fill-current opacity-80" /> Lesson Plan
            </button>
          </div>
        </section>

        <DashboardNotifications />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Left Column */}
          <div className="md:col-span-8 flex flex-col gap-8">
             {/* School Announcements */}
             {latestAnnouncement && (
               <div className="bg-primary-container/10 rounded-3xl border border-primary-container/30 p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-surface-container-lowest rounded-full flex items-center justify-center shrink-0 border-2 border-primary-container z-10 shadow-sm">
                     <Megaphone className="w-5 h-5 md:w-8 md:h-8 text-primary opacity-80" />
                  </div>
                  
                  <div className="flex-1">
                     <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-label text-base text-on-surface font-bold">{latestAnnouncement.title}</h3>
                        <span className="font-caption text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-sm uppercase tracking-wide font-bold">New</span>
                     </div>
                     <p className="font-body text-on-surface-variant text-sm line-clamp-2">
                        {latestAnnouncement.content ? (() => {
                          try {
                             const contentStr = atob(latestAnnouncement.content).replace(/<[^>]+>/g, '');
                             return contentStr.replace(/\$\$_role:\s*(.*?)\s*(?:_\$\$|\$\$)\s*/is, '');
                          } catch (e) {
                             return latestAnnouncement.content.replace(/<[^>]+>/g, '').replace(/\$\$_role:\s*(.*?)\s*(?:_\$\$|\$\$)\s*/is, '');
                          }
                        })() : ''}
                     </p>
                  </div>
                  
                  <button 
                    onClick={() => navigate('/teacher/announcements')}
                    className="font-label text-sm text-primary font-bold hover:underline shrink-0"
                  >
                     Read More
                  </button>
               </div>
             )}

             {/* Agenda */}
             <div className="bg-surface-container-lowest rounded-3xl border border-surface-variant p-8 shadow-[0_4px_20px_rgba(212,175,55,0.05)] relative overflow-hidden">
                 <div className="flex justify-between items-center z-10 relative mb-8 border-b border-surface-variant pb-4">
                    <h3 className="font-title text-xl text-on-surface flex items-center gap-3 font-bold">
                       <Calendar className="text-primary w-6 h-6" />
                       Today's Schedule
                    </h3>
                    <span className="font-caption text-sm text-on-surface-variant font-bold">
                       {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </span>
                 </div>
                 
                 <div className="space-y-4">
                   <ScheduleItem time="08:30 AM" end="10:00 AM" title="Morning Check-in" location="Main Hall" current />
                   <ScheduleItem block time="11:45 AM" end="12:30 PM" title="Lunch Break" location="Staff Room" />
                 </div>
             </div>

             {/* Quick Actions */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="bg-surface-container-low p-6 rounded-2xl border-b-4 border-tertiary-container/40 hover:border-tertiary-container transition-colors shadow-sm flex flex-col gap-4 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <Bookmark className="text-tertiary w-6 h-6" />
                      <span className="text-2xl font-display font-bold text-on-surface">--</span>
                    </div>
                    <div>
                      <h4 className="font-label font-bold text-on-surface mb-1">Grade Pending</h4>
                      <p className="font-caption text-sm text-on-surface-variant">Mid-term history essays</p>
                    </div>
                 </div>

                 <div className="bg-surface-container-low p-6 rounded-2xl border-b-4 border-secondary-container/40 hover:border-secondary-container transition-colors shadow-sm flex flex-col gap-4 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <CheckCircle2 className="text-secondary w-6 h-6" />
                      <span className="text-2xl font-display font-bold text-on-surface">--</span>
                    </div>
                    <div>
                      <h4 className="font-label font-bold text-on-surface mb-1">Approved Plans</h4>
                      <p className="font-caption text-sm text-on-surface-variant">For next week's classes</p>
                    </div>
                 </div>
             </div>

             {/* My Programs */}
             <div className="bg-surface-container-lowest rounded-3xl border border-surface-variant p-8 shadow-[0_4px_20px_rgba(212,175,55,0.05)] flex flex-col gap-6">
               <h3 className="font-title text-xl text-on-surface flex items-center gap-3 font-bold">
                  <BookOpen className="text-primary w-6 h-6" />
                  Assigned Programs
               </h3>
               <div className="flex flex-col gap-3">
                  {assignedClasses.length > 0 ? assignedClasses.map(cls => (
                     <div key={cls.class_id} className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
                        <div>
                           <h4 className="font-label font-bold text-on-surface">{cls.class_name || cls.name || 'Unnamed Class'}</h4>
                           <p className="font-caption text-xs text-on-surface-variant mt-1">{cls.programs?.program_name || 'No program'}</p>
                        </div>
                        <span className="px-3 py-1 bg-secondary-container/20 text-secondary rounded-full font-label text-xs font-bold">Teacher</span>
                     </div>
                  )) : (
                     <p className="text-sm text-on-surface-variant py-2">No assigned programs found.</p>
                  )}
               </div>
             </div>
          </div>

          {/* Right Column */}
          <div className="md:col-span-4 flex flex-col gap-8">
             
             {/* Recent Submissions Status */}
             <div className="bg-surface-container-lowest rounded-3xl border border-surface-variant p-8 shadow-[0_4px_20px_rgba(212,175,55,0.05)] flex flex-col gap-6">
                <h3 className="font-title text-xl text-on-surface flex items-center gap-3 font-bold">
                   <Clock className="text-primary w-6 h-6" />
                   My Submissions
                </h3>
                
                <div className="flex flex-col gap-4">
                   {recentSubmissions.length > 0 ? recentSubmissions.map((sub, i) => {
                      let st = 'draft';
                      if (sub.status === 'Pending Approval') st = 'pending';
                      else if (sub.status === 'Published') st = 'approved';
                      else if (sub.status === 'Rejected') st = 'changes';
                      return <SubmissionItem key={i} title={sub.title} status={st} date={sub.date || "Unknown"} />
                   }) : (
                      <p className="text-on-surface-variant text-sm py-4 text-center">No recent submissions found.</p>
                   )}
                </div>

                <button 
                   onClick={() => navigate('/teacher/newsletters')}
                   className="w-full mt-2 py-3 font-label text-sm text-primary border border-primary/20 rounded-full hover:bg-primary-container/10 transition-colors font-bold">
                   View All Newsletters
                </button>
             </div>
             
             {/* Highlight / Inspiration */}
             <div className="bg-[#fdfbe9] rounded-3xl border border-[#d4af37]/40 p-8 shadow-[0_4px_20px_rgba(212,175,55,0.08)] flex flex-col gap-4 relative overflow-hidden group">
                <div className="absolute -right-8 -top-8 text-primary/10 transition-transform group-hover:scale-110 duration-700">
                    <Flame className="w-48 h-48" />
                </div>
                <h3 className="font-title text-xl text-on-surface font-bold z-10">Teacher Resource</h3>
                <p className="font-body text-on-surface-variant z-10 leading-relaxed text-sm">
                  Explore the new interactive maps for historical routes. Designed for Smartboards.
                </p>
                <span className="font-label text-sm text-primary flex items-center gap-1.5 mt-2 font-bold cursor-pointer hover:underline z-10 w-fit">
                   Explore Library <ArrowRight className="w-4 h-4" />
                </span>
             </div>

          </div>

        </div>
      </div>
    </div>
  );
}

function ScheduleItem({ time, end, title, location, current, block }: any) {
  if (block) {
    return (
       <div className="flex gap-4 p-4 rounded-xl bg-surface-variant/30 items-center justify-center border border-outline-variant/30 border-dashed">
          <span className="font-label text-sm text-on-surface-variant opacity-80">{time}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-outline-variant/50"></span>
          <span className="font-label text-sm text-on-surface-variant opacity-80">{title}</span>
       </div>
    );
  }

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
