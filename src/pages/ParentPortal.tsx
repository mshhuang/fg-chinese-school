import { useState, useEffect } from "react";
import { Copy as Sun, FileText, Clock, MessageSquare, AlertTriangle, Users, CheckCircle2, Coins, BookOpen, Megaphone, Calendar } from "lucide-react";
import { cn, extractPlainText } from "../lib/utils";
import { QRCodeBadge } from "../components/QRCodeBadge";
import { QrCode } from "lucide-react";
import { fetchVisibleAnnouncements } from "../lib/announcementUtils";
import { supabase } from "../lib/supabase";
import { ParentChatbot } from "../components/ParentChatbot";

export default function ParentPortal() {
  const [activeChild, setActiveChild] = useState<string>("mei");
  const [children, setChildren] = useState<any[]>([]);
  const [announcement, setAnnouncement] = useState<any>(null);
  const [showQrCode, setShowQrCode] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState<'checked_in' | 'checked_out' | 'not_checked_in' | 'loading'>('loading');
  const [checkInTime, setCheckInTime] = useState("");

  useEffect(() => {
    async function fetchChildren() {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      const u = JSON.parse(userStr);
      if (!u || !u.id || u.id === 'demo') return;

      let mappedChildren = [];
      const userEmail = u.email;

      if (userEmail) {
         // Find all users with this email
         const { data: childrenByEmail, error: emailError } = await supabase
            .from('users')
            .select('user_id, first_name, last_name, grade')
            .eq('email', userEmail);

         if (!emailError && childrenByEmail && childrenByEmail.length > 0) {
            mappedChildren = childrenByEmail.filter((c: any) => c.user_id !== u.id);
         }
      }

      if (mappedChildren.length === 0) {
         // Fallback to parent_child
         const { data, error } = await supabase
           .from('parent_child')
           .select(`
             child_id,
             users:child_id (
               user_id,
               first_name,
               last_name,
               grade
             )
           `)
           .eq('parent_id', u.id) as any;

         if (!error && data) {
            mappedChildren = data.map((d: any) => d.users).filter(Boolean);
         }
      }

      if (mappedChildren.length > 0) {
         setChildren(mappedChildren);
         setActiveChild(mappedChildren[0].user_id);
         fetchCheckInStatus(mappedChildren[0].user_id);
      }
      
      const anns = await fetchVisibleAnnouncements(u, localStorage.getItem('current_role') || u.role || 'parent', 1);
      if (anns && anns.length > 0) {
         setAnnouncement(anns[0]);
      }
    }
    fetchChildren();
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
    <div className="p-6 md:p-8 flex flex-col gap-8 w-full pb-32 md:pb-8 max-w-[1600px] mx-auto">
      {/* Header & Child Switcher */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h2 className="font-display text-4xl text-on-surface font-bold hidden md:block">
              {children.length > 0 ? `${children.map(c => c.first_name).join(' & ')}'s Dashboard` : "My Family Dashboard"}
           </h2>
           <p className="font-body text-lg text-on-surface-variant mt-2 hidden md:block">Overview and upcoming events</p>
        </div>
        
        <div className="flex gap-4 bg-surface-container-low p-2 rounded-full border border-outline-variant/30 shadow-sm w-full md:w-auto overflow-x-auto">
          {children.length > 0 ? (
             children.map((child) => (
                <ChildSelector 
                   key={child.user_id}
                   name={`${child.first_name}`} 
                   grade={child.grade || "Student"} 
                   img={`https://api.dicebear.com/7.x/initials/svg?seed=${child.first_name}`} // fallback avatar
                   active={activeChild === child.user_id} 
                   onClick={() => {
    setActiveChild(child.user_id);
    fetchCheckInStatus(child.user_id);
  }} 
                />
             ))
          ) : (
             <>
                <ChildSelector 
                  name="Mei Lin" 
                  grade="Grade 4" 
                  img="https://images.unsplash.com/photo-1544717297-fa95b6ee9643?q=80&w=150&auto=format&fit=crop" 
                  active={activeChild === "mei"} 
                  onClick={() => setActiveChild("mei")} 
                />
                <ChildSelector 
                  name="Wei Lin" 
                  grade="Grade 2" 
                  img="https://images.unsplash.com/photo-1519345182560-3f2917c472ef?q=80&w=150&auto=format&fit=crop" 
                  active={activeChild === "wei"} 
                  onClick={() => setActiveChild("wei")} 
                />
             </>
          )}
        </div>
      </section>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* School Announcements */}
        {announcement && (
        <div className="md:col-span-12 bg-primary-container/10 rounded-3xl border border-primary-container/30 p-8 shadow-sm flex items-center gap-6">
           <div className="w-16 h-16 bg-surface-container-lowest rounded-full flex items-center justify-center shrink-0 border-2 border-primary-container z-10 shadow-sm">
              <Megaphone className="w-8 h-8 text-primary opacity-80" />
           </div>
           
           <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                 <h3 className="font-label text-base text-on-surface font-bold">{announcement.title}</h3>
                 <span className="font-caption text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-sm uppercase tracking-wide font-bold">New</span>
              </div>
              <p className="font-body text-on-surface-variant text-sm line-clamp-2">
                 {extractPlainText(announcement.content)}
              </p>
           </div>
           
           <a href="/parent/announcements" className="font-label text-sm text-primary font-bold hover:underline shrink-0 px-4">
              Read More
           </a>
        </div>
        )}

        {/* Daily Snapshot */}
        <div className="md:col-span-8 bg-surface-container-lowest rounded-3xl border border-surface-variant p-8 shadow-[0_4px_20px_rgba(212,175,55,0.05)] relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/10 rounded-full -mr-32 -mt-32 pointer-events-none blur-2xl"></div>
           
           <div className="flex justify-between items-center z-10 relative mb-8">
              <h3 className="font-title text-xl text-on-surface flex items-center gap-3 font-bold">
                 <Sun className="text-primary w-6 h-6" />
                 Daily Snapshot
              </h3>
              <div className="flex items-center gap-3">
                 <button onClick={() => setShowQrCode(true)} className="font-caption text-sm bg-primary/10 hover:bg-primary/20 text-primary px-4 py-1.5 rounded-full flex items-center gap-2 transition-colors font-bold">
                    <QrCode className="w-4 h-4" /> Student ID Badge
                 </button>
                 <span className={`font-caption text-sm px-4 py-1.5 rounded-full flex items-center gap-2 border font-bold ${checkInStatus === 'checked_in' ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#2E7D32]/30' : checkInStatus === 'checked_out' ? 'bg-[#FFF3E0] text-[#E65100] border-[#E65100]/30' : 'bg-surface-variant text-on-surface-variant border-outline-variant/30'}`}>
                    <CheckCircle2 className="w-4 h-4" /> {checkInStatus === 'loading' ? 'Loading...' : checkInStatus === 'checked_in' ? (() => {
                       const cName = children.find(c => c.user_id === activeChild)?.first_name || (activeChild === 'mei' ? 'Mei' : activeChild === 'wei' ? 'Wei' : 'Student');
                       if (!checkInTime) return `${cName} is in the school`;
                       const d = new Date(checkInTime);
                       const timeStr = d.toLocaleTimeString('en-US', { timeZone: 'America/New_York',  hour: 'numeric', minute: '2-digit' , timeZoneName: 'short'});
                       const dateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
                       return `${cName} arrived at school at ${timeStr} on ${dateStr}`;
                    })() : checkInStatus === 'checked_out' ? `${children.find(c => c.user_id === activeChild)?.first_name || (activeChild === 'mei' ? 'Mei' : activeChild === 'wei' ? 'Wei' : 'Student')} is ready to go home` : 'Not Checked In'}
                 </span>
              </div>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 z-10 relative">
              {/* Homework */}
              <div className="bg-surface-container-low p-6 rounded-2xl border-b-4 border-primary-container/40 hover:border-primary-container transition-colors shadow-sm">
                 <div className="flex items-start justify-between mb-4">
                    <span className="font-label text-sm text-on-surface-variant">Homework</span>
                    <FileText className="text-secondary-container w-5 h-5" />
                 </div>
                 <p className="font-display text-2xl font-bold text-on-surface">2 Pending</p>
                 <p className="font-caption text-sm text-on-surface-variant mt-2">Math Worksheet, Reading Log</p>
              </div>
              
              {/* Up Next */}
              <div className="bg-surface-container-low p-6 rounded-2xl border-b-4 border-tertiary-container/40 hover:border-tertiary-container transition-colors shadow-sm">
                 <div className="flex items-start justify-between mb-4">
                    <span className="font-label text-sm text-on-surface-variant">Up Next</span>
                    <Clock className="text-tertiary w-5 h-5" />
                 </div>
                 <p className="font-display text-2xl font-bold text-on-surface">Calligraphy</p>
                 <p className="font-caption text-sm text-on-surface-variant mt-2">1:30 PM • Room 302</p>
              </div>
           </div>
        </div>

        {/* Messages */}
        <div className="md:col-span-4 bg-surface-container-lowest rounded-3xl border border-surface-variant p-8 shadow-[0_4px_20px_rgba(212,175,55,0.05)] flex flex-col gap-6">
           <div className="flex justify-between items-center">
              <h3 className="font-title text-xl text-on-surface flex items-center gap-3 font-bold">
                 <MessageSquare className="text-primary w-6 h-6" />
                 Messages
              </h3>
              <div className="w-6 h-6 bg-error-container text-on-error-container rounded-full flex items-center justify-center font-label text-xs font-bold shadow-sm">1</div>
           </div>
           
           <div className="flex-1 flex flex-col justify-center">
              <button className="flex items-start gap-4 p-4 rounded-2xl bg-surface-container-low hover:bg-surface border border-outline-variant/30 text-left transition-all hover:shadow-sm">
                 <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop" className="w-10 h-10 rounded-full border-2 border-primary-container object-cover mt-1 shrink-0" alt="Ms. Chen" />
                 <div>
                    <div className="flex justify-between items-center mb-1">
                       <span className="font-label text-sm text-on-surface font-bold">Ms. Chen (Math)</span>
                       <span className="font-caption text-xs text-primary font-bold">9:12 AM</span>
                    </div>
                    <p className="font-caption text-sm text-on-surface-variant line-clamp-2 leading-relaxed">Mei did excellent work on her fractions today. Please review...</p>
                 </div>
              </button>
           </div>
           
           <button className="w-full py-3 font-label text-sm text-primary border border-primary/20 rounded-full hover:bg-primary-container/10 transition-colors font-bold">
              View All Messages
           </button>
        </div>

        {/* Tuition */}
        <div className="md:col-span-6 bg-surface-container-lowest rounded-3xl border border-surface-variant p-8 shadow-[0_4px_20px_rgba(212,175,55,0.05)]">
           <h3 className="font-title text-xl text-on-surface flex items-center gap-3 font-bold mb-6">
              <Coins className="text-primary w-6 h-6" /> Tuition & Fees
           </h3>
           <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-surface-variant/20 rounded-2xl border border-outline-variant/40 gap-6">
              <div>
                 <p className="font-label text-sm text-on-surface-variant mb-2">Fall Semester Balance</p>
                 <p className="font-display text-4xl text-on-surface font-bold">$1,250.00</p>
                 <p className="font-caption text-sm text-error mt-2 flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4" /> Due in 14 days
                 </p>
              </div>
              <button className="bg-primary text-on-primary font-label text-sm px-8 py-4 rounded-full hover:bg-primary/90 transition-colors shadow-md w-full sm:w-auto font-bold self-start sm:self-center">
                 Pay Now
              </button>
           </div>
        </div>

        {/* Enrolled Programs */}
        <div className="md:col-span-6 flex flex-col gap-8">
           <div className="bg-surface-container-lowest rounded-3xl border border-surface-variant p-8 shadow-[0_4px_20px_rgba(212,175,55,0.05)]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-title text-xl text-on-surface flex items-center gap-3 font-bold">
                   <BookOpen className="text-primary w-6 h-6" /> {children.find(c => c.user_id === activeChild)?.first_name || (activeChild === 'mei' ? "Mei" : activeChild === 'wei' ? "Wei" : "My")}'s Programs
                </h3>
                <button className="font-label text-sm text-primary hover:underline font-bold">Manage</button>
              </div>
              
              <div className="flex flex-col gap-3">
                 <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
                    <div>
                       <h4 className="font-label font-bold text-on-surface">Core Curriculum</h4>
                       <p className="font-caption text-xs text-on-surface-variant mt-1">
                          {children.find(c => c.user_id === activeChild)?.grade ? `Grade ${children.find(c => c.user_id === activeChild)?.grade}` : 'Enrolled'}
                       </p>
                    </div>
                    <span className="px-3 py-1 bg-secondary-container/20 text-secondary rounded-full font-label text-xs font-bold">Active</span>
                 </div>
                 <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
                    <div>
                       <h4 className="font-label font-bold text-on-surface">Extracurricular Activity</h4>
                       <p className="font-caption text-xs text-on-surface-variant mt-1">Weekend Session</p>
                    </div>
                    <span className="px-3 py-1 bg-secondary-container/20 text-secondary rounded-full font-label text-xs font-bold">Active</span>
                 </div>
              </div>
           </div>
        </div>

      </div>

      {showQrCode && (
         <QRCodeBadge 
            studentId={children.find(c => c.user_id === activeChild)?.user_id || (activeChild === "mei" ? "mei_lin_id" : activeChild === "wei" ? "wei_lin_id" : activeChild)} 
            studentName={children.find(c => c.user_id === activeChild) ? `${children.find(c => c.user_id === activeChild).first_name} ${children.find(c => c.user_id === activeChild).last_name}`.trim() : (activeChild === "mei" ? "Mei Lin" : "Wei Lin")} 
            onClose={() => setShowQrCode(false)} 
            title="Student ID Badge"
         />
      )}

      <ParentChatbot />
    </div>
  );
}

function ChildSelector({ name, grade, img, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 py-2 px-4 rounded-full transition-all shrink-0 border",
        active 
          ? "bg-surface-container-lowest shadow-sm border-primary-container/40" 
          : "hover:bg-surface-variant/50 opacity-70 hover:opacity-100 border-transparent"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-full border-[3px] overflow-hidden transition-colors",
        active ? "border-primary-container" : "border-outline-variant"
      )}>
        <img src={img} alt={name} className="w-full h-full object-cover" />
      </div>
      <div className="text-left">
        <span className={cn("font-label text-sm block", active ? "text-on-surface" : "text-on-surface-variant")}>{name}</span>
        <span className="font-caption text-xs text-on-surface-variant block">{grade}</span>
      </div>
    </button>
  );
}
