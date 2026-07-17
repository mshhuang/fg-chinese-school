import { useState, useEffect } from "react";
import { BookOpen, Award, TrendingUp, Calendar, ChevronRight } from "lucide-react";
import { cn } from "../lib/utils";
import { supabase } from "../lib/supabase";

const GRADES: Record<string, any> = {
  mei: {
    name: "Mei Lin",
    gpa: "3.8",
    recent: [
      { subject: "Chinese Literature", score: "95%", grade: "A", date: "Oct 24", type: "Quiz" },
      { subject: "Math", score: "88%", grade: "B+", date: "Oct 20", type: "Exam" },
      { subject: "Calligraphy", score: "92%", grade: "A-", date: "Oct 15", type: "Project" }
    ]
  },
  wei: {
    name: "Wei Lin",
    gpa: "3.5",
    recent: [
      { subject: "Chinese Basics", score: "90%", grade: "A-", date: "Oct 25", type: "Quiz" },
      { subject: "Math Basics", score: "85%", grade: "B", date: "Oct 22", type: "Homework" }
    ]
  }
};

export default function ParentGrades() {
  const [activeChild, setActiveChild] = useState<string>("mei");
  const [children, setChildren] = useState<any[]>([]);

  useEffect(() => {
    async function fetchChildren() {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      const u = JSON.parse(userStr);
      if (!u || !u.id || u.id === 'demo') return;

      let mappedChildren = [];
      const userEmail = u.email;

      if (userEmail) {
         const { data: childrenByEmail, error: emailError } = await supabase
            .from('users')
            .select('user_id, first_name, last_name, grade')
            .eq('email', userEmail);
         if (!emailError && childrenByEmail && childrenByEmail.length > 0) {
            mappedChildren = childrenByEmail.filter((c: any) => c.user_id !== u.id);
         }
      }

      if (mappedChildren.length === 0) {
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
      }
    }
    fetchChildren();
  }, []);

  const childNameKey = children.find(c => c.user_id === activeChild)?.first_name?.toLowerCase() || 'mei';
  const data = GRADES[childNameKey] || GRADES['mei'];

  return (
    <div className="w-full max-w-[1600px] mx-auto p-6 md:p-8 flex flex-col gap-8 pb-32 md:pb-8">
       {/* Header */}
       <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div>
           <h1 className="font-display text-4xl text-primary font-bold tracking-tight">Grades & Progress</h1>
           <p className="font-body text-lg text-on-surface-variant mt-2">View academic performance and upcoming assessments.</p>
         </div>
         
         <div className="flex gap-4 bg-surface-container-low p-2 rounded-full border border-outline-variant/30 shadow-sm w-full md:w-auto overflow-x-auto">
            {children.length > 0 ? (
               children.map(child => (
                  <button 
                    key={child.user_id}
                    onClick={() => setActiveChild(child.user_id)}
                    className={cn("px-6 py-2 rounded-full font-label text-sm transition-all font-bold", activeChild === child.user_id ? "bg-primary-container text-on-primary-container shadow-sm" : "text-on-surface-variant hover:bg-surface-variant")}
                  >
                    {child.first_name} {child.last_name}
                  </button>
               ))
            ) : (
              <>
                <button 
                  onClick={() => setActiveChild("mei")}
                  className={cn("px-6 py-2 rounded-full font-label text-sm transition-all font-bold", activeChild === "mei" ? "bg-primary-container text-on-primary-container shadow-sm" : "text-on-surface-variant hover:bg-surface-variant")}
                >
                  Mei Lin
                </button>
                <button 
                  onClick={() => setActiveChild("wei")}
                  className={cn("px-6 py-2 rounded-full font-label text-sm transition-all font-bold", activeChild === "wei" ? "bg-primary-container text-on-primary-container shadow-sm" : "text-on-surface-variant hover:bg-surface-variant")}
                >
                  Wei Lin
                </button>
              </>
            )}
         </div>
       </header>

       {/* GPA Card */}
       <div className="bg-surface-container-lowest rounded-3xl border border-surface-variant p-8 shadow-[0_4px_20px_rgba(212,175,55,0.05)] flex items-center justify-between">
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 rounded-full bg-primary-container/30 flex items-center justify-center text-primary">
                <Award className="w-8 h-8" />
             </div>
             <div>
                <p className="font-label text-sm text-on-surface-variant uppercase tracking-wider font-bold mb-1">Current GPA</p>
                <h2 className="font-display text-4xl font-bold text-on-surface">{data.gpa}</h2>
             </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-secondary font-label font-bold bg-secondary-container/20 px-4 py-2 rounded-full">
             <TrendingUp className="w-4 h-4" /> Top 10% of class
          </div>
       </div>

       {/* Recent Grades */}
       <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-outline-variant/20 bg-surface-container-low flex justify-between items-center">
             <h3 className="font-title text-xl font-bold flex items-center gap-2">
               <BookOpen className="w-5 h-5 text-primary" />
               Recent Assessments
             </h3>
             <button className="text-primary font-label text-sm font-bold hover:underline py-1">View Full Report</button>
          </div>
          
          <div className="divide-y divide-outline-variant/20">
             {data.recent.map((grade, idx) => (
                <div key={idx} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-surface-variant/30 transition-colors gap-4">
                   <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-surface-variant/50 flex flex-col items-center justify-center shrink-0">
                         <span className="font-caption text-[10px] uppercase text-on-surface-variant font-bold">{grade.date.split(' ')[0]}</span>
                         <span className="font-label text-sm text-on-surface font-bold">{grade.date.split(' ')[1]}</span>
                      </div>
                      <div>
                         <h4 className="font-label text-base font-bold text-on-surface">{grade.subject}</h4>
                         <p className="font-caption text-sm text-on-surface-variant flex items-center gap-2 mt-1">
                            {grade.type}
                         </p>
                      </div>
                   </div>
                   <div className="flex items-center gap-6 pl-16 sm:pl-0">
                      <div className="text-right">
                         <span className="block font-display text-2xl font-bold text-primary">{grade.score}</span>
                         <span className="block font-caption text-xs text-on-surface-variant">Score</span>
                      </div>
                      <div className="text-right px-4 border-l border-outline-variant/30">
                         <span className="block font-display text-2xl font-bold text-on-surface">{grade.grade}</span>
                         <span className="block font-caption text-xs text-on-surface-variant">Letter</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-on-surface-variant hidden sm:block" />
                   </div>
                </div>
             ))}
          </div>
       </div>

    </div>
  );
}
