import { useState } from "react";
import { Filter, CheckCircle2, Bookmark, Clock, CheckCircle } from "lucide-react";
import { cn } from "../lib/utils";

export default function ReviewPlans() {
  const [selectedPlan, setSelectedPlan] = useState<number>(1);

  return (
    <div className="w-full max-w-[1600px] mx-auto flex flex-col lg:h-screen lg:overflow-hidden bg-background">
       <header className="px-6 md:px-8 py-8 md:py-10 pb-4">
         <h1 className="font-display text-4xl text-primary font-bold tracking-tight">Lesson Plan Review</h1>
       </header>

       <div className="flex-1 w-full px-6 md:px-8 pb-32 md:pb-8 flex flex-col lg:flex-row gap-8 min-h-0">
          
          {/* Left Column: Pending List */}
          <div className="w-full lg:w-[400px] flex flex-col gap-4 lg:h-full lg:overflow-y-auto hide-scrollbar">
             <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30 sticky top-0 bg-background z-10 pt-2">
                <h3 className="font-title text-xl text-primary font-bold">Pending (3)</h3>
                <button className="text-primary-container font-label text-sm hover:underline flex items-center gap-1.5 font-bold">
                    Filter <Filter className="w-4 h-4" />
                </button>
             </div>

             <div className="space-y-4 pb-4">
                <PlanListItem 
                  id={1}
                  teacher="Li Wei"
                  subject="Grade 4 - Literature"
                  title="Tang Dynasty Poetry Intro"
                  date="Oct 24"
                  time="Submitted 2 hours ago"
                  active={selectedPlan === 1}
                  onClick={() => setSelectedPlan(1)}
                  avatar="https://images.unsplash.com/photo-1544717297-fa95b6ee9643?q=80&w=150&auto=format&fit=crop"
                />
                <PlanListItem 
                  id={2}
                  teacher="Chen Jian"
                  subject="Grade 6 - History"
                  title="Silk Road Trade Routes"
                  date="Oct 25"
                  time="Submitted yesterday"
                  active={selectedPlan === 2}
                  onClick={() => setSelectedPlan(2)}
                  avatar="https://images.unsplash.com/photo-1519345182560-3f2917c472ef?q=80&w=150&auto=format&fit=crop"
                />
                <PlanListItem 
                  id={3}
                  teacher="Wang Fang"
                  subject="Grade 3 - Calligraphy"
                  title="Basic Strokes & Posture"
                  date="Oct 26"
                  time="Submitted yesterday"
                  active={selectedPlan === 3}
                  onClick={() => setSelectedPlan(3)}
                  avatar="https://images.unsplash.com/photo-1517673132405-a56a62b18caf?q=80&w=150&auto=format&fit=crop"
                />
             </div>
          </div>

          {/* Right Column: Detail View */}
          <div className="flex-1 bg-surface/80 backdrop-blur-xl border border-outline-variant/40 rounded-3xl p-8 lg:p-10 shadow-sm flex flex-col gap-8 h-[700px] lg:h-full lg:overflow-y-auto">
             
             {/* Header */}
             <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-outline-variant/20 pb-8 shrink-0">
               <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-1.5 bg-tertiary-container/20 text-tertiary border border-tertiary-container/30 rounded-full font-label text-sm flex items-center gap-2 font-bold">
                       <Bookmark className="w-4 h-4" /> Literature
                    </span>
                    <span className="px-4 py-1.5 bg-surface-container-high text-on-surface-variant rounded-full font-label text-sm font-bold">
                       Grade 4
                    </span>
                  </div>
                  <h2 className="font-display text-3xl md:text-4xl text-on-surface font-bold leading-tight">Tang Dynasty Poetry Intro</h2>
                  <p className="font-body text-on-surface-variant flex items-center gap-2 mt-1">
                     <Clock className="w-5 h-5 text-outline" /> Scheduled: Oct 24, 2023
                  </p>
               </div>

               <div className="hidden md:flex items-center gap-4 shrink-0">
                  <button className="px-8 py-3 rounded-full border-2 border-tertiary text-tertiary font-label font-bold hover:bg-tertiary/5 transition-colors">
                     Request Changes
                  </button>
                  <button className="px-8 py-3 rounded-full bg-primary-container text-on-primary-container font-label font-bold hover:bg-primary-container/90 shadow-sm flex items-center gap-2 transition-all">
                     <CheckCircle2 className="w-5 h-5 fill-current opacity-80" /> Approve
                  </button>
               </div>
             </div>

             {/* Content Sections */}
             <div className="flex-col gap-10 flex-1 overflow-y-auto pr-4 space-y-10 custom-scroll">
               
               <section className="space-y-4">
                  <h4 className="font-title text-xl text-primary flex items-center gap-3 border-b border-surface-variant pb-2">
                     <Bookmark className="w-5 h-5" /> Learning Objectives
                  </h4>
                  <ul className="space-y-3 font-body text-on-surface pl-4">
                     <li className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-2.5 before:w-2 before:h-2 before:bg-secondary-container before:rounded-full">
                       Students will identify the common structures of jueju (four-line poetry).
                     </li>
                     <li className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-2.5 before:w-2 before:h-2 before:bg-secondary-container before:rounded-full">
                       Students will analyze the imagery used in Li Bai's "Quiet Night Thought".
                     </li>
                     <li className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-2.5 before:w-2 before:h-2 before:bg-secondary-container before:rounded-full">
                       Students will practice reciting the poem with appropriate rhythm and tone.
                     </li>
                  </ul>
               </section>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <section className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                    <h4 className="font-title text-lg text-primary mb-4 flex items-center gap-2 border-b border-surface-variant pb-2">
                       <Clock className="w-5 h-5" /> Timeline
                    </h4>
                    <div className="flex flex-col gap-4 font-body text-on-surface">
                       <div className="flex gap-4 items-start">
                          <span className="text-on-surface-variant w-14 shrink-0 font-bold">10 min</span>
                          <span>Introduction & Historical Context (Visuals)</span>
                       </div>
                       <div className="flex gap-4 items-start">
                          <span className="text-on-surface-variant w-14 shrink-0 font-bold">15 min</span>
                          <span>Guided Reading & Vocabulary</span>
                       </div>
                    </div>
                 </section>

                 <section className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                    <h4 className="font-title text-lg text-primary mb-4 flex items-center gap-2 border-b border-surface-variant pb-2">
                       <CheckCircle className="w-5 h-5" /> Materials Required
                    </h4>
                    <ul className="list-disc list-inside font-body text-on-surface space-y-2 text-on-surface-variant pl-2">
                       <li>Smartboard for visual presentation</li>
                       <li>Printed copies of "Quiet Night Thought"</li>
                       <li>Traditional calligraphy brushes (props)</li>
                    </ul>
                 </section>
               </div>

             </div>

             {/* Footer Actions (Mobile) */}
             <div className="md:hidden flex flex-col gap-3 mt-6 pt-6 border-t border-outline-variant/20 shrink-0">
               <button className="w-full py-4 rounded-full bg-primary-container text-on-primary-container font-label font-bold text-center shadow-sm">
                  Approve Plan
               </button>
               <button className="w-full py-4 rounded-full border-2 border-tertiary text-tertiary font-label font-bold text-center">
                  Request Changes
               </button>
             </div>

          </div>

       </div>
    </div>
  );
}

function PlanListItem({ teacher, subject, title, date, time, active, onClick, avatar }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-2xl p-5 flex flex-col gap-4 transition-all duration-300 relative overflow-hidden group outline-none",
        active 
          ? "bg-surface-container-low border border-primary-container shadow-sm transform scale-[1.02]" 
          : "bg-surface border border-outline-variant/40 hover:border-outline-variant hover:bg-surface-container-lowest opacity-80 hover:opacity-100"
      )}
    >
      {active && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary-container rounded-l-2xl"></div>}
      
      <div className="flex justify-between items-start w-full">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-outline-variant/50 p-0.5 bg-surface overflow-hidden shrink-0">
            <img src={avatar} alt={teacher} className="w-full h-full rounded-full object-cover" />
          </div>
          <div>
            <span className="font-label text-sm text-on-surface block font-bold">{teacher}</span>
            <span className="font-caption text-xs text-on-surface-variant block mt-0.5">{subject}</span>
          </div>
        </div>
        <span className={cn(
          "font-caption text-xs px-3 py-1 rounded-full font-bold",
          active ? "bg-secondary-container/20 text-secondary" : "bg-surface-container-high text-on-surface-variant"
        )}>
          {date}
        </span>
      </div>
      
      <div className="w-full">
        <p className="font-body text-base text-on-surface font-bold truncate pr-4">{title}</p>
        <p className="font-caption text-xs text-on-surface-variant mt-2 tracking-wide uppercase">{time}</p>
      </div>
    </button>
  );
}
