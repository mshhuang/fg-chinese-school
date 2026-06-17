import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Check, Volume2, Star, Edit3, Lock, ChevronRight, Megaphone, Users } from "lucide-react";
import { cn } from "../lib/utils";
import { supabase } from "../lib/supabase";

export default function StudentPortal() {
  const [userName, setUserName] = useState("Mei");
  const [parents, setParents] = useState<any[]>([]);

  useEffect(() => {
    async function fetchStudentData() {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user && user.first_name) {
            setUserName(user.first_name);
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
          }
        } catch (e) {
          console.error("Error parsing user from localStorage", e);
        }
      }
    }
    fetchStudentData();
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-10 w-full pb-32 md:pb-8">
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
            🔥 14 Days
          </div>
        </div>
        
        <div className="flex-1 text-center md:text-left z-10">
          <h1 className="font-title text-2xl md:text-4xl text-primary font-bold mb-2">Welcome back, {userName}!</h1>
          <p className="font-body text-lg text-on-surface-variant mb-4">Your journey of knowledge continues. You're doing great!</p>
          
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
        <div className="lg:col-span-12 bg-primary-container/10 rounded-3xl border border-primary-container/30 p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6">
           <div className="w-12 h-12 md:w-16 md:h-16 bg-surface-container-lowest rounded-full flex items-center justify-center shrink-0 border-2 border-primary-container z-10 shadow-sm">
              <Megaphone className="w-5 h-5 md:w-8 md:h-8 text-primary opacity-80" />
           </div>
           
           <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                 <h3 className="font-label text-base text-on-surface font-bold">School Announcements</h3>
                 <span className="font-caption text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-sm uppercase tracking-wide font-bold">New</span>
              </div>
              <p className="font-body text-on-surface-variant text-sm">Spring Festival Gala Rehearsals begin next week. All students in the singing program must attend exactly on time.</p>
           </div>
           
           <Link to="/student/announcements" className="font-label text-sm text-primary font-bold hover:underline shrink-0">
              Read More
           </Link>
        </div>

        {/* Main Column */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Today's Path */}
          <section className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-title text-xl text-on-surface flex items-center gap-3 font-bold">
                <BookOpen className="text-tertiary w-6 h-6" />
                Today's Path
              </h2>
              <span className="font-caption bg-tertiary-container/30 text-tertiary font-bold px-4 py-1.5 rounded-full border border-tertiary-container/50">2 Tasks Left</span>
            </div>
            
            <div className="space-y-4">
              {/* Task 1 */}
              <div className="flex items-center gap-4 p-5 rounded-2xl bg-surface-container-low border border-outline-variant/50 hover:bg-surface transition-all group cursor-pointer shadow-sm hover:shadow">
                 <button className="w-8 h-8 rounded-full border-2 border-outline flex items-center justify-center group-hover:border-primary transition-colors shrink-0"></button>
                 <div className="flex-1 min-w-0">
                    <h3 className="font-body text-lg font-bold text-on-surface truncate">Complete Character Practice worksheet</h3>
                    <p className="font-caption text-sm text-on-surface-variant mt-1.5">Mandarin Arts • Due 3:00 PM</p>
                 </div>
                 <ChevronRight className="text-outline-variant group-hover:text-primary transition-colors w-6 h-6 shrink-0" />
              </div>

              {/* Task 2 Complete */}
              <div className="flex items-center gap-4 p-5 rounded-2xl bg-surface-container-lowest opacity-60 border border-outline-variant/20 shadow-none">
                 <div className="w-8 h-8 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center shrink-0">
                    <Check className="w-5 h-5" />
                 </div>
                 <div className="flex-1 min-w-0">
                    <h3 className="font-body text-lg text-on-surface line-through truncate">Review Chapter 4 History Notes</h3>
                    <p className="font-caption text-sm text-on-surface-variant mt-1.5">Dynasty Studies • Completed</p>
                 </div>
              </div>
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
                <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-primary-container/10 border border-primary-container/20">
                   <h4 className="font-label font-bold text-primary">Chinese School</h4>
                   <p className="font-caption text-xs text-on-surface-variant">In-person • Grade 4</p>
                </div>
                <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-secondary-container/10 border border-secondary-container/20">
                   <h4 className="font-label font-bold text-secondary">Singing Class</h4>
                   <p className="font-caption text-xs text-on-surface-variant">Weekend • Intermediate</p>
                </div>
                <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-tertiary-container/10 border border-tertiary-container/20">
                   <h4 className="font-label font-bold text-tertiary">Summer Camp</h4>
                   <p className="font-caption text-xs text-on-surface-variant">Enrolled for upcoming season</p>
                </div>
             </div>
           </section>

           {/* Achievements */}
           <section className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-8 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <h2 className="font-title text-xl font-bold text-on-surface">Achievements</h2>
                <button className="font-label text-sm text-primary hover:underline font-bold">View All</button>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <Badge icon={Star} label="Week Scholar" color="tertiary" active />
                <Badge icon={Edit3} label="Calligraphy Pro" color="secondary" active />
                <Badge icon={Lock} label="Math Master" />
                <Badge icon={Lock} label="Perfect Attend" />
             </div>
           </section>

           {/* Class Moments */}
           <section className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-8 shadow-sm">
              <h2 className="font-title text-xl font-bold text-on-surface mb-6">Class Moments</h2>
              <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 snap-x">
                 <div className="w-40 h-32 rounded-2xl overflow-hidden shrink-0 snap-start border border-outline-variant/20 shadow-sm relative group cursor-pointer">
                    <img src="https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=300&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Class" />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                 </div>
                 <div className="w-40 h-32 rounded-2xl overflow-hidden shrink-0 snap-start border border-outline-variant/20 shadow-sm relative group cursor-pointer">
                    <img src="https://images.unsplash.com/photo-1544254272-97b762ac9f78?q=80&w=300&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Writing" />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                 </div>
                 <div className="w-32 h-32 rounded-2xl bg-surface-container flex items-center justify-center shrink-0 snap-start border border-outline-variant/30 hover:bg-surface-container-high transition-colors cursor-pointer">
                    <span className="font-label text-sm text-primary font-bold">+5 More</span>
                 </div>
              </div>
           </section>

        </div>
      </div>
    </div>
  );
}

function Badge({ icon: Icon, label, active, color }: any) {
  const colors: any = {
    tertiary: "bg-tertiary-container text-on-tertiary-container",
    secondary: "bg-secondary-container text-on-secondary-container"
  };

  return (
    <div className={cn(
      "flex flex-col items-center p-4 rounded-2xl border text-center transition-all",
      active ? "bg-surface-container-low border-surface-variant hover:border-outline-variant/50" : "bg-surface-container-lowest opacity-50 border-dashed border-outline-variant"
    )}>
      <div className={cn(
        "w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-sm",
        active ? colors[color] : "bg-surface-variant text-on-surface-variant"
      )}>
        <Icon className={cn("w-6 h-6", active ? "fill-current" : "")} />
      </div>
      <span className={cn("font-caption text-xs mt-2", active ? "font-bold text-on-surface" : "text-on-surface-variant")}>{label}</span>
    </div>
  );
}
