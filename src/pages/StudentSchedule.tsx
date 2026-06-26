import { Calendar, Clock, MapPin, ImageIcon, X, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { EventCalendar } from "../components/EventCalendar";
import { SchoolEvent, fetchSchoolEvents } from "../lib/events";
import { format, parse, isAfter, startOfDay } from "date-fns";

export default function StudentSchedule() {
  const [classesWithImages, setClassesWithImages] = useState<any[]>([]);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [showFullCalendar, setShowFullCalendar] = useState(false);

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
    
    async function fetchUpcomingEvents() {
       setLoadingEvents(true);
       try {
           const allEvents = await fetchSchoolEvents();
           const roleFilter = ["Student", "Academic", "School", "Holiday", "Extracurricular"];
           const today = startOfDay(new Date());
           
           const filtered = allEvents.filter(e => {
               if (!roleFilter.includes(e.type)) return false;
               if (!e.date) return false;
               const eventDate = parse(e.date, 'yyyy-MM-dd', new Date());
               return !isAfter(today, eventDate); // upcoming or today
           });
           
           filtered.sort((a, b) => {
               const dateA = parse(a.date, 'yyyy-MM-dd', new Date());
               const dateB = parse(b.date, 'yyyy-MM-dd', new Date());
               return dateA.getTime() - dateB.getTime();
           });
           
           setEvents(filtered); // show all upcoming
       } catch (err) {
           console.error("Failed to fetch events", err);
       } finally {
           setLoadingEvents(false);
       }
    }
    
    fetchClasses();
    fetchUpcomingEvents();
  }, []);

  const getEventIcon = (type: string) => {
     switch (type) {
         case 'Extracurricular': return '🎭';
         case 'Holiday': return '🚫';
         case 'Academic': return '📝';
         case 'School': return '🏫';
         case 'Volunteer': return '🤝';
         default: return '📅';
     }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto p-6 md:p-8 flex flex-col gap-8 pb-32 md:pb-8">
       {/* Header */}
       <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div>
           <h1 className="font-display text-4xl text-primary font-bold tracking-tight">Schedule</h1>
           <p className="font-body text-lg text-on-surface-variant mt-2">View your daily timetable and upcoming events.</p>
         </div>
       </header>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
           {/* Schedule List */}
           <div className="flex flex-col gap-6 w-full">
              <h3 className="font-title text-xl text-on-surface flex items-center gap-3 font-bold uppercase tracking-wider">
                 MY SCHEDULE
              </h3>
              {classesWithImages.length > 0 ? (
                <div className="flex flex-col gap-6">
                   {classesWithImages.map(cls => (
                      <div key={cls.class_id} className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-2 shadow-sm overflow-hidden flex flex-col items-center">
                         <div className="w-full rounded-2xl overflow-hidden bg-surface-variant/10 cursor-pointer relative group" onClick={() => setEnlargedImage(cls.schedule_image_url)}>
                            <img src={cls.schedule_image_url} alt="Schedule Announcement" className="object-cover w-full h-auto transition-transform duration-300" referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                               <span className="bg-surface text-on-surface font-label text-sm font-bold px-4 py-2 rounded-full">View Full Image</span>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
              ) : (
                <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-8 shadow-sm text-center">
                   <p className="text-on-surface-variant font-body">No schedule image available.</p>
                </div>
              )}
           </div>
           
           {/* Upcoming Events */}
           <div className="flex flex-col gap-4 w-full mt-2 bg-[#f3fae8] rounded-[20px] p-4 md:p-5 relative overflow-hidden" 
                style={{ backgroundImage: 'radial-gradient(#dcf0c5 20%, transparent 20%)', backgroundSize: '12px 12px' }}>
             
             <div className="flex flex-col items-center justify-center py-4 relative z-10 mb-2">
                 <div className="relative flex flex-col items-center font-display uppercase font-black text-[#0b1f3f] leading-[0.85] text-3xl md:text-5xl">
                     <span className="tracking-tight z-10">UPCOMING</span>
                     <span className="tracking-tight z-10">EVENTS</span>
                 </div>
             </div>
             
             <div className="flex flex-col gap-3 relative z-10 pb-2">
                 {loadingEvents ? (
                    <div className="flex justify-center items-center py-6">
                        <Loader2 className="w-6 h-6 animate-spin text-[#0b1f3f]" />
                    </div>
                 ) : events.length > 0 ? (
                    events.slice(0, 5).map((event, index) => {
                        const isEven = index % 2 === 0;
                        const badgeColors = ["#ff3385", "#4db8ff", "#e6ff00", "#85e6a3"];
                        const badgeColor = badgeColors[index % badgeColors.length];
                        const dateText = event.date ? format(parse(event.date, 'yyyy-MM-dd', new Date()), 'M/d') : '';
                        const dayText = event.date ? format(parse(event.date, 'yyyy-MM-dd', new Date()), 'EEE.') : '';
                        
                        return (
                            <div key={`${event.id}-${index}`} className={cn("flex items-center", isEven ? "flex-row" : "flex-row-reverse")}>
                                <div className={cn("relative flex items-center justify-center w-[60px] h-[60px] shrink-0", isEven ? "-mr-4 z-20" : "-ml-4 z-20")}>
                                  <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-[3px_3px_0_#0b1f3f]">
                                    <polygon 
                                      points="50,2 61,16 78,13 83,30 98,35 91,50 98,65 83,70 78,87 61,84 50,98 39,84 22,87 17,70 2,65 9,50 2,35 17,30 22,13 39,16" 
                                      fill={badgeColor} 
                                      stroke="#0b1f3f" 
                                      strokeWidth="3.5" 
                                      strokeLinejoin="round" 
                                    />
                                  </svg>
                                  <div className="relative z-10 flex flex-col items-center justify-center text-[#0b1f3f] mt-0.5">
                                    <span className="text-xl font-black font-display leading-none">{dateText}</span>
                                    <span className="text-[10px] font-bold font-label uppercase tracking-widest mt-0.5">{dayText}</span>
                                  </div>
                                </div>
                                
                                <div className="flex-1 relative min-w-0">
                                    <div className={cn(
                                        "bg-[#fcfdfa] border-2 border-[#0b1f3f] rounded-2xl p-3 py-4 shadow-[3px_3px_0_#0b1f3f] flex flex-col h-full min-h-[60px] justify-center relative",
                                        isEven ? "pl-8" : "pr-8 items-end text-right"
                                    )}>
                                        <h4 className="font-display font-black text-sm md:text-base text-[#0b1f3f] leading-tight mb-1 truncate whitespace-normal line-clamp-2 w-full">
                                            {event.title}
                                        </h4>
                                        <div className={cn("flex items-center gap-1.5 text-[#0b1f3f] font-label font-bold text-xs", !isEven && "flex-row-reverse")}>
                                            <Clock className="w-3 h-3" strokeWidth={2.5} />
                                            <span>
                                                {event.start_time || ''} 
                                                {event.start_time && event.end_time && ' - '}
                                                {event.end_time || ''}
                                                {(!event.start_time && !event.end_time) && 'TBD'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Decorative elements based on index */}
                                    {index === 0 && (
                                        <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-[#e6ff00] border-2 border-[#0b1f3f] shadow-[2px_2px_0_#0b1f3f] flex items-center justify-center rotate-12 z-30">
                                            <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#0b1f3f]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M8 9h.01M16 9h.01M8 14c2 2.5 6 2.5 8 0" />
                                            </svg>
                                        </div>
                                    )}
                                    {index === 2 && (
                                        <div className="absolute -bottom-2 -right-1 w-10 h-10 z-30 drop-shadow-[2px_2px_0_#0b1f3f]">
                                            <svg viewBox="0 0 100 100" fill="none" stroke="#0b1f3f" strokeWidth="4">
                                                <path d="M50 15 C 60 15, 65 30, 75 35 C 85 40, 90 55, 80 65 C 70 75, 50 85, 50 85 C 50 85, 30 75, 20 65 C 10 55, 15 40, 25 35 C 35 30, 40 15, 50 15 Z" fill="white" />
                                                <circle cx="50" cy="50" r="15" fill="#ff3385" stroke="#0b1f3f" strokeWidth="4" />
                                                <path d="M43 47h.01M57 47h.01M45 54c2.5 2 7.5 2 10 0" stroke="#0b1f3f" strokeWidth="3" strokeLinecap="round" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                 ) : (
                    <div className="text-center py-6 text-[#0b1f3f] font-label font-bold bg-white/50 rounded-xl border-2 border-[#0b1f3f] border-dashed text-sm">
                        No upcoming events.
                    </div>
                 )}
                 
                 {events.length > 5 && (
                    <div className="text-center text-[#0b1f3f] font-label font-bold text-xs mt-2 uppercase tracking-wider">
                        + {events.length - 5} more events
                    </div>
                 )}
                 
                 <button 
                    onClick={() => setShowFullCalendar(true)}
                    className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-[16px] bg-[#0b1f3f] text-white hover:bg-[#0b1f3f]/90 shadow-[3px_3px_0_#0b1f3f] active:translate-y-1 active:shadow-none transition-all font-display font-bold text-sm md:text-base uppercase tracking-wider"
                 >
                    <Calendar className="w-4 h-4 md:w-5 md:h-5" /> Open Full Calendar
                 </button>
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

       {showFullCalendar && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8 animate-in fade-in duration-200">
             <div className="bg-surface w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
                 <div className="flex justify-between items-center p-6 border-b border-outline-variant/20 bg-surface-container-lowest sticky top-0 z-10">
                    <h2 className="font-display text-2xl font-bold text-on-surface flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-primary" /> Full Calendar
                    </h2>
                    <button 
                        onClick={() => setShowFullCalendar(false)}
                        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-variant transition-colors text-on-surface-variant"
                    >
                        <X className="w-6 h-6" />
                    </button>
                 </div>
                 <div className="p-6 overflow-y-auto">
                    <EventCalendar roleFilter={["Student", "Academic", "School", "Holiday", "Extracurricular"]} />
                 </div>
             </div>
         </div>
       )}
    </div>
  );
}
