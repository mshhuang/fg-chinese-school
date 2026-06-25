import { Calendar, Clock, MapPin, ImageIcon, X } from "lucide-react";
import { cn } from "../lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const SCHEDULE = [
  { time: "08:30 AM", class: "Homeroom", room: "Room 302", teacher: "Ms. Chen" },
  { time: "09:00 AM", class: "Chinese Literature", room: "Room 302", teacher: "Ms. Chen" },
  { time: "10:30 AM", class: "Math", room: "Room 305", teacher: "Mr. Lin" },
  { time: "11:30 AM", class: "Lunch", room: "Cafeteria", teacher: "Staff" },
  { time: "12:30 PM", class: "Science", room: "Room 102", teacher: "Mrs. Wong" },
  { time: "01:30 PM", class: "Calligraphy", room: "Art Room", teacher: "Mr. Zhang" }
];

export default function StudentSchedule() {
  const [classesWithImages, setClassesWithImages] = useState<any[]>([]);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClasses() {
       const userStr = localStorage.getItem('user');
       if (!userStr) return;
       const u = JSON.parse(userStr);
       if (!u || !u.id || u.id === 'demo') return;

       // Fetch enrollments for this student
       const { data: enrollData } = await supabase.from('enrollments').select('class_id').eq('student_id', u.id);
       if (!enrollData || enrollData.length === 0) return;

       const classIds = enrollData.map((e:any) => e.class_id).filter(Boolean);
       if (classIds.length === 0) return;

       const { data: clsData } = await supabase.from('classes').select('*').in('class_id', classIds);
       
       if (clsData) {
         setClassesWithImages(clsData.filter((c: any) => c.schedule_image_url));
       }
    }
    fetchClasses();
  }, []);

  return (
    <div className="w-full max-w-[1600px] mx-auto p-6 md:p-8 flex flex-col gap-8 pb-32 md:pb-8">
       {/* Header */}
       <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div>
           <h1 className="font-display text-4xl text-primary font-bold tracking-tight">My Schedule</h1>
           <p className="font-body text-lg text-on-surface-variant mt-2">View your daily timetable and upcoming events.</p>
         </div>
       </header>

       <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
           {/* Schedule List */}
           <div className="xl:col-span-7 flex flex-col gap-6 relative">
              {classesWithImages.length > 0 && (
                <div className="flex flex-col gap-4 mb-4">
                   <h3 className="font-title text-xl text-on-surface flex items-center gap-3 font-bold">
                      <ImageIcon className="text-primary w-6 h-6" /> Class Announcements
                   </h3>
                   {classesWithImages.map(cls => (
                      <div key={cls.class_id} className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-4 md:p-6 shadow-sm overflow-hidden flex flex-col items-center">
                         <h4 className="font-display text-2xl font-bold mb-4 w-full">{cls.class_name}</h4>
                         <div className="w-full rounded-xl overflow-hidden border border-outline-variant/30 flex items-center justify-center bg-surface-variant/30 cursor-pointer" onClick={() => setEnlargedImage(cls.schedule_image_url)}>
                            <img src={cls.schedule_image_url} alt="Schedule Announcement" className="object-contain w-full h-auto hover:scale-[1.02] transition-transform duration-300" referrerPolicy="no-referrer" />
                         </div>
                      </div>
                   ))}
                </div>
              )}
              
              {/* <div className="flex flex-col gap-4 relative">
                <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-outline-variant/30 hidden md:block" />
                
                {SCHEDULE.map((item, idx) => (
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
              </div> */}
           </div>
           
           {/* Event Calendar Component Context */}
           <div className="xl:col-span-5 bg-surface-container-lowest rounded-3xl border border-surface-variant p-8 shadow-[0_4px_20px_rgba(212,175,55,0.05)] flex flex-col gap-6 self-start">
             <h3 className="font-title text-xl text-on-surface flex items-center gap-3 font-bold mb-2">
                <Calendar className="text-primary w-6 h-6" /> School Calendar
             </h3>
             <div className="flex flex-col gap-8">
                {/* Visual Calendar Grid */}
                <div className="flex flex-col bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30">
                   <div className="flex justify-between items-center mb-6">
                      <h4 className="font-label font-bold text-on-surface text-lg">October 2023</h4>
                      <div className="flex gap-2 text-on-surface-variant">
                        <button className="w-8 h-8 flex items-center justify-center hover:bg-surface-variant rounded-full transition-colors">&lt;</button>
                        <button className="w-8 h-8 flex items-center justify-center hover:bg-surface-variant rounded-full transition-colors">&gt;</button>
                      </div>
                   </div>
                   <div className="grid grid-cols-7 gap-2 text-center mb-4 border-b border-outline-variant/20 pb-2">
                      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                        <span key={d} className="font-label text-xs font-bold text-on-surface-variant">{d}</span>
                      ))}
                   </div>
                   <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center font-body text-sm">
                      {/* Empty slots for start of month */}
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                        <div key={d} className="flex items-center justify-center">
                           <span className={cn(
                             "w-8 h-8 flex items-center justify-center rounded-full",
                             d === 25 ? "bg-primary text-on-primary font-bold shadow-sm" :
                             d === 12 ? "bg-surface-variant text-on-surface-variant font-bold" :
                             "text-on-surface hover:bg-surface-variant cursor-pointer transition-colors"
                           )}>
                              {d}
                           </span>
                        </div>
                      ))}
                   </div>
                </div>

                {/* Upcoming Events */}
                <div className="flex flex-col gap-4">
                   <h4 className="font-label font-bold text-on-surface mb-2">Upcoming Events</h4>
                   <div className="flex items-center gap-4 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 hover:shadow-sm transition-shadow">
                      <div className="w-14 h-14 bg-primary-container/30 rounded-xl flex flex-col items-center justify-center shrink-0 border border-primary/10">
                         <span className="font-caption text-[10px] text-primary uppercase font-bold">Oct</span>
                         <span className="font-label text-xl text-primary font-bold leading-none mt-0.5">25</span>
                      </div>
                      <div>
                         <h4 className="font-label font-bold text-on-surface text-base">Spring Festival Gala</h4>
                         <p className="font-caption text-xs text-on-surface-variant flex items-center gap-1.5 mt-1.5">
                            <Clock className="w-3.5 h-3.5" /> 6:00 PM - 8:30 PM
                         </p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 hover:shadow-sm transition-shadow">
                      <div className="w-14 h-14 bg-surface-variant uppercase items-center justify-center flex flex-col rounded-xl shrink-0 border border-outline-variant/50">
                         <span className="font-caption text-[10px] text-on-surface-variant font-bold">Nov</span>
                         <span className="font-label text-xl text-on-surface-variant font-bold leading-none mt-0.5">12</span>
                      </div>
                      <div>
                         <h4 className="font-label font-bold text-on-surface text-base">School Spirit Day</h4>
                         <p className="font-caption text-xs text-on-surface-variant flex items-center gap-1.5 mt-1.5">
                            <Clock className="w-3.5 h-3.5" /> All Day
                         </p>
                      </div>
                   </div>
                </div>
             </div>
           </div>
       </div>

       {enlargedImage && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setEnlargedImage(null)}>
             <img src={enlargedImage} className="max-w-full max-h-full object-contain rounded-lg" alt="Enlarged schedule" />
             <button className="absolute top-6 right-6 text-white bg-black/50 p-2 rounded-full hover:bg-black/80 transition-colors cursor-pointer" onClick={() => setEnlargedImage(null)}>
               <X className="w-6 h-6" />
             </button>
         </div>
       )}
    </div>
  );
}
