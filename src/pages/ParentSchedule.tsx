import { useState } from "react";
import { Calendar, Clock, MapPin } from "lucide-react";
import { cn } from "../lib/utils";
import { EventCalendar } from "../components/EventCalendar";

const SCHEDULE = {
  mei: [
    { time: "08:30 AM", class: "Homeroom", room: "Room 302", teacher: "Ms. Chen" },
    { time: "09:00 AM", class: "Chinese Literature", room: "Room 302", teacher: "Ms. Chen" },
    { time: "10:30 AM", class: "Math", room: "Room 305", teacher: "Mr. Lin" },
    { time: "11:30 AM", class: "Lunch", room: "Cafeteria", teacher: "Staff" },
    { time: "12:30 PM", class: "Science", room: "Room 102", teacher: "Mrs. Wong" },
    { time: "01:30 PM", class: "Calligraphy", room: "Art Room", teacher: "Mr. Zhang" }
  ],
  wei: [
    { time: "08:30 AM", class: "Homeroom", room: "Room 104", teacher: "Ms. Lee" },
    { time: "09:00 AM", class: "Reading Basics", room: "Room 104", teacher: "Ms. Lee" },
    { time: "10:00 AM", class: "Math Basics", room: "Room 104", teacher: "Ms. Lee" },
    { time: "11:00 AM", class: "Lunch", room: "Cafeteria", teacher: "Staff" },
    { time: "12:00 PM", class: "Art & Crafts", room: "Art Room", teacher: "Mr. Zhang" },
    { time: "01:00 PM", class: "Physical Education", room: "Gym", teacher: "Coach Wu" }
  ]
};

export default function ParentSchedule() {
  const [activeChild, setActiveChild] = useState<"mei" | "wei">("mei");
  const data = SCHEDULE[activeChild];

  return (
    <div className="w-full max-w-[1600px] mx-auto p-6 md:p-8 flex flex-col gap-8 pb-32 md:pb-8">
       {/* Header */}
       <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div>
           <h1 className="font-display text-4xl text-primary font-bold tracking-tight">Class Schedule</h1>
           <p className="font-body text-lg text-on-surface-variant mt-2">View daily timetable and locations.</p>
         </div>
         
         <div className="flex gap-4 bg-surface-container-low p-2 rounded-full border border-outline-variant/30 shadow-sm w-full md:w-auto overflow-x-auto">
            <button 
              onClick={() => setActiveChild("mei")}
              className={cn("px-6 py-2 rounded-full font-label text-sm transition-all font-bold whitespace-nowrap", activeChild === "mei" ? "bg-primary-container text-on-primary-container shadow-sm" : "text-on-surface-variant hover:bg-surface-variant")}
            >
              Mei Lin
            </button>
            <button 
              onClick={() => setActiveChild("wei")}
              className={cn("px-6 py-2 rounded-full font-label text-sm transition-all font-bold whitespace-nowrap", activeChild === "wei" ? "bg-primary-container text-on-primary-container shadow-sm" : "text-on-surface-variant hover:bg-surface-variant")}
            >
              Wei Lin
            </button>
         </div>
       </header>

       {/* Schedule List and Calendar Grid */}
       <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
           <div className="xl:col-span-7 flex flex-col gap-4 relative">
              <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-outline-variant/30 hidden md:block" />
              
              {data.map((item, idx) => (
                 <div key={idx} className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-6 flex items-start gap-6 hover:shadow-md transition-shadow relative z-10 w-full">
                    <div className="w-12 h-12 rounded-full bg-primary-container/30 border-4 border-surface-container-lowest flex shrink-0 items-center justify-center text-primary mt-1 shadow-sm hidden md:flex">
                       <Clock className="w-5 h-5" />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between flex-1 gap-4">
                       <div>
                          <span className="font-label text-sm text-primary font-bold md:hidden flex items-center gap-2 mb-2">
                             <Clock className="w-4 h-4" /> {item.time}
                          </span>
                          <h3 className="font-title text-xl font-bold text-on-surface">{item.class}</h3>
                          <div className="flex items-center gap-4 mt-2 text-on-surface-variant font-caption text-sm">
                             <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {item.room}</span>
                             <span>Teacher: {item.teacher}</span>
                          </div>
                       </div>
                       
                       <span className="font-display text-xl font-bold text-on-surface text-right hidden md:block">
                          {item.time}
                       </span>
                    </div>
                 </div>
              ))}
           </div>

           {/* Event Calendar Component Context */}
           <div className="xl:col-span-5 bg-surface-container-lowest rounded-3xl border border-surface-variant p-8 shadow-[0_4px_20px_rgba(212,175,55,0.05)] flex flex-col gap-6 self-start">
             <h3 className="font-title text-xl text-on-surface flex items-center gap-3 font-bold mb-2">
                <Calendar className="text-primary w-6 h-6" /> School Calendar
             </h3>
             <EventCalendar roleFilter={["Academic", "School", "Holiday", "Extracurricular"]} />
           </div>
       </div>
    </div>
  );
}
