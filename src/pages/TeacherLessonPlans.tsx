import { useState } from "react";
import { Search, Filter, Plus, BookOpen, Clock, Edit3, Trash2, CheckCircle2 } from "lucide-react";
import { cn } from "../lib/utils";

const LESSONS = [
  {
    id: 1,
    title: "Week 4: Poetry of the Tang Dynasty",
    class: "Grade 4 Chinese Literature",
    date: "Oct 24, 2023",
    status: "Approved",
  },
  {
    id: 2,
    title: "Intro to Calligraphy Basics",
    class: "Summer Camp Session 1",
    date: "Draft",
    status: "Draft",
  },
  {
    id: 3,
    title: "Modern Short Stories Analysis",
    class: "Grade 5 Advanced Reading",
    date: "Oct 26, 2023",
    status: "Pending",
  }
];

export default function TeacherLessonPlans() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const STATUSES = ["All", "Draft", "Pending", "Approved"];

  const filteredLessons = LESSONS.filter(l => {
    const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) || l.class.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "All" || l.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="w-full max-w-[1600px] mx-auto p-6 md:p-8 flex flex-col gap-8 pb-32 md:pb-8">
       {/* Header */}
       <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div>
           <h1 className="font-display text-4xl text-primary font-bold tracking-tight">Lesson Plans</h1>
           <p className="font-body text-lg text-on-surface-variant mt-2">Create and manage your lesson plans.</p>
         </div>
         <button className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-label font-bold hover:bg-primary/90 transition-colors shadow-md w-full md:w-auto justify-center">
            <Plus className="w-5 h-5" /> New Lesson Plan
         </button>
       </header>

       {/* Toolbar */}
       <div className="flex flex-col xl:flex-row justify-between gap-6">
          {/* Filters */}
          <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar w-full xl:w-auto">
             {STATUSES.map(status => (
                <button
                  key={status}
                  onClick={() => setActiveFilter(status)}
                  className={cn(
                    "whitespace-nowrap px-6 py-2.5 rounded-full font-label text-sm transition-all border font-bold shrink-0",
                    activeFilter === status 
                      ? "bg-primary-container text-on-primary-container border-primary-container shadow-sm" 
                      : "bg-surface text-on-surface-variant border-outline-variant/40 hover:bg-surface-variant/50"
                  )}
                >
                   {status}
                </button>
             ))}
          </div>

          {/* Search */}
          <div className="flex items-center gap-3 bg-surface-container-low rounded-full px-4 py-2 border border-outline-variant/40 shrink-0 w-full xl:w-80 shadow-sm focus-within:border-primary/50 transition-colors">
             <Search className="w-5 h-5 text-on-surface-variant" />
             <input 
               type="text" 
               placeholder="Search lesson plans..." 
               className="bg-transparent border-none outline-none font-body text-sm w-full"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
             <button className="p-1.5 text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors">
               <Filter className="w-4 h-4" />
             </button>
          </div>
       </div>

       {/* List / Grid */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredLessons.map(lesson => (
             <div key={lesson.id} className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-6 flex flex-col hover:shadow-md transition-all shadow-sm">
                 <div className="flex justify-between items-start mb-4">
                    <span className={cn(
                       "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-label flex items-center gap-1.5",
                       lesson.status === "Approved" ? "bg-primary-container/20 text-primary border border-primary/20" : 
                       lesson.status === "Pending" ? "bg-tertiary-container/30 text-tertiary-dim border border-tertiary/20" :
                       "bg-surface-variant text-on-surface-variant border border-outline-variant/30"
                    )}>
                       {lesson.status === "Approved" ? <CheckCircle2 className="w-3 h-3" /> : 
                        lesson.status === "Pending" ? <Clock className="w-3 h-3" /> :
                        <Edit3 className="w-3 h-3" />}
                       {lesson.status}
                    </span>
                    <div className="flex gap-2">
                       <button className="w-8 h-8 rounded-full hover:bg-surface-variant flex items-center justify-center text-on-surface-variant transition-colors">
                          <Edit3 className="w-4 h-4" />
                       </button>
                       <button className="w-8 h-8 rounded-full hover:bg-error-container/50 hover:text-error flex items-center justify-center text-on-surface-variant transition-colors">
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                 </div>

                 <h3 className="font-display text-xl font-bold text-on-surface mb-2">{lesson.title}</h3>
                 <p className="font-label text-sm text-on-surface-variant font-bold mb-6 flex items-center gap-2">
                   <BookOpen className="w-4 h-4" /> {lesson.class}
                 </p>

                 <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20 mt-auto">
                    <span className="font-caption text-xs text-on-surface-variant">{lesson.date}</span>
                    <button className="text-primary font-label text-sm font-bold hover:underline">
                      View Details
                    </button>
                 </div>
             </div>
          ))}

          {filteredLessons.length === 0 && (
             <div className="col-span-full flex flex-col items-center justify-center p-12 bg-surface-container-low border border-dashed border-outline-variant/40 rounded-3xl">
                <BookOpen className="w-12 h-12 text-on-surface-variant opacity-50 mb-4" />
                <p className="font-body text-lg text-on-surface font-medium">No lesson plans found</p>
             </div>
          )}
       </div>
    </div>
  );
}
