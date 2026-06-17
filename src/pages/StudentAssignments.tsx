import { useState } from "react";
import { BookOpen, Clock, CheckCircle2, ChevronRight, AlertCircle } from "lucide-react";
import { cn } from "../lib/utils";

const ASSIGNMENTS = [
  {
    id: 1,
    title: "Tang Dynasty Poetry Essay",
    subject: "Chinese Literature",
    dueDate: "Tomorrow, 11:59 PM",
    status: "pending",
    type: "Writing"
  },
  {
    id: 2,
    title: "Calligraphy Practice Set 4",
    subject: "Art",
    dueDate: "Oct 28, 2023",
    status: "submitted",
    type: "Practice"
  },
  {
    id: 3,
    title: "Math Chapter 5 Problems",
    subject: "Mathematics",
    dueDate: "Oct 30, 2023",
    status: "pending",
    type: "Homework"
  },
  {
    id: 4,
    title: "Science Fair Proposal",
    subject: "Science",
    dueDate: "Nov 5, 2023",
    status: "late",
    type: "Project"
  }
];

export default function StudentAssignments() {
  const [activeTab, setActiveTab] = useState("all");

  const filteredAssignments = ASSIGNMENTS.filter(a => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return a.status === "pending" || a.status === "late";
    if (activeTab === "completed") return a.status === "submitted";
    return true;
  });

  return (
    <div className="w-full max-w-[1600px] mx-auto p-6 md:p-8 flex flex-col gap-8 pb-32 md:pb-8">
       {/* Header */}
       <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div>
           <h1 className="font-display text-4xl text-primary font-bold tracking-tight">Assignments</h1>
           <p className="font-body text-lg text-on-surface-variant mt-2">Manage your homework and projects.</p>
         </div>
       </header>

       {/* Tabs */}
       <div className="flex gap-4 border-b border-outline-variant/30">
          <button 
            onClick={() => setActiveTab("all")}
            className={cn("pb-4 font-label font-bold text-sm transition-all border-b-2", activeTab === "all" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface")}
          >
            All Assignments
          </button>
          <button 
            onClick={() => setActiveTab("pending")}
            className={cn("pb-4 font-label font-bold text-sm transition-all border-b-2", activeTab === "pending" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface")}
          >
            To Do
          </button>
          <button 
            onClick={() => setActiveTab("completed")}
            className={cn("pb-4 font-label font-bold text-sm transition-all border-b-2", activeTab === "completed" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface")}
          >
            Completed
          </button>
       </div>

       {/* List xs:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssignments.map(assignment => (
             <div key={assignment.id} className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 flex flex-col hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                   <span className={cn(
                     "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-label flex items-center gap-1.5",
                     assignment.status === "submitted" ? "bg-primary-container/20 text-primary border border-primary/20" :
                     assignment.status === "late" ? "bg-error-container/20 text-error border border-error/20" :
                     "bg-tertiary-container/20 text-tertiary border border-tertiary/20"
                   )}>
                      {assignment.status === "submitted" ? <CheckCircle2 className="w-3.5 h-3.5" /> : 
                       assignment.status === "late" ? <AlertCircle className="w-3.5 h-3.5" /> :
                       <Clock className="w-3.5 h-3.5" />}
                      {assignment.status}
                   </span>
                   <span className="font-caption text-xs text-on-surface-variant border border-outline-variant/50 px-2.5 py-1 rounded-md">
                     {assignment.type}
                   </span>
                </div>
                
                <h3 className="font-title text-xl font-bold text-on-surface mb-2">{assignment.title}</h3>
                <p className="font-label text-sm text-on-surface-variant mb-6 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> {assignment.subject}
                </p>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-outline-variant/20">
                   <div className="flex flex-col">
                     <span className="font-caption text-[10px] uppercase text-on-surface-variant font-bold tracking-wider">Due Date</span>
                     <span className={cn("font-label text-sm font-bold", assignment.status === "late" ? "text-error" : "text-on-surface")}>{assignment.dueDate}</span>
                   </div>
                   <button className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-on-primary transition-colors">
                      <ChevronRight className="w-5 h-5" />
                   </button>
                </div>
             </div>
          ))}

          {filteredAssignments.length === 0 && (
             <div className="col-span-full flex flex-col items-center justify-center p-12 bg-surface-container-low border border-dashed border-outline-variant/40 rounded-3xl">
                <CheckCircle2 className="w-12 h-12 text-primary opacity-50 mb-4" />
                <p className="font-body text-lg text-on-surface font-medium">All caught up!</p>
             </div>
          )}
       </div>
    </div>
  );
}
