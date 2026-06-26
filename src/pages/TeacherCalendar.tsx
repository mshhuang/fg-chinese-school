import { useState, useEffect } from "react";
import { EventCalendar } from "../components/EventCalendar";
import { Calendar, Clock, MapPin, Loader2 } from "lucide-react";
import { SchoolEvent, fetchSchoolEvents } from "../lib/events";
import { format, parse } from "date-fns";
import { cn } from "../lib/utils";

export default function TeacherCalendar() {
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    const data = await fetchSchoolEvents();
    const roleFilter = ["Staff", "Teacher", "Academic", "School", "Holiday", "Extracurricular", "Volunteer"];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filtered = data.filter(e => {
       if (!roleFilter.includes(e.type)) return false;
       if (!e.date) return false;
       const eventDate = parse(e.date, 'yyyy-MM-dd', new Date());
       return eventDate >= today;
    });
    
    filtered.sort((a, b) => {
       const dateA = a.date || '';
       const dateB = b.date || '';
       if (dateA !== dateB) {
           return dateA.localeCompare(dateB);
       }
       const timeA = a.start_time || '';
       const timeB = b.start_time || '';
       return timeA.localeCompare(timeB);
    });

    setEvents(filtered);
    setLoading(false);
  };

  const typeColors: Record<string, string> = {
    Academic: "bg-blue-100 text-blue-800",
    Holiday: "bg-red-100 text-red-800",
    Staff: "bg-purple-100 text-purple-800",
    Volunteer: "bg-orange-100 text-orange-800",
    Extracurricular: "bg-green-100 text-green-800",
    School: "bg-primary-container text-on-primary-container",
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto p-6 md:p-8 flex flex-col gap-8 pb-32 md:pb-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="font-display text-4xl text-primary font-bold tracking-tight">School Calendar</h1>
          <p className="font-body text-lg text-on-surface-variant mt-2">View upcoming events, holidays, and academic schedules.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        <div className="xl:col-span-7 bg-surface-container-lowest rounded-3xl border border-surface-variant p-6 md:p-8 shadow-[0_4px_20px_rgba(212,175,55,0.05)] flex flex-col gap-6">
          <h3 className="font-title text-xl text-on-surface flex items-center gap-3 font-bold mb-2 uppercase tracking-wider">
             <Calendar className="text-primary w-6 h-6" /> Event Calendar
          </h3>
          <EventCalendar roleFilter={["Staff", "Teacher", "Academic", "School", "Holiday", "Extracurricular", "Volunteer"]} />
        </div>

        <div className="xl:col-span-5 flex flex-col gap-2 w-full max-w-md mx-auto">
           <div className="flex flex-col items-center justify-center py-2 relative shrink-0">
               <span className="font-label text-xs font-bold tracking-[0.2em] text-on-surface uppercase mb-3">
                  EVENTS
               </span>
               <div className="relative">
                  <span className="absolute -left-6 top-0 text-base opacity-60">✦</span>
                  <h3 className="font-display text-xl text-on-surface font-medium text-center leading-tight">
                     Upcoming<br />schedule
                  </h3>
                  <span className="absolute -right-6 bottom-0 text-base opacity-60">✦</span>
               </div>
           </div>
           
           <div className="flex flex-col gap-4 max-h-[392px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-surface-variant/50 hover:scrollbar-thumb-surface-variant">
               {loading ? (
                  <div className="flex justify-center items-center py-10">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
               ) : events.length > 0 ? (
                  events.map((event, index) => (
                      <div key={`${event.id}-${index}`} className="flex items-center gap-4 p-2 pr-4 rounded-[2rem] bg-[#f0e8e1]/60 hover:bg-[#f0e8e1] transition-colors">
                          <div className="flex flex-col items-center justify-center bg-white rounded-[1.5rem] w-[70px] h-[70px] shadow-sm shrink-0">
                              <span className="text-[10px] font-bold tracking-widest text-on-surface uppercase mb-1">
                                  {event.date ? format(parse(event.date, 'yyyy-MM-dd', new Date()), 'MMM') : ''}
                              </span>
                              <span className="text-2xl font-bold text-on-surface leading-none font-display">
                                  {event.date ? format(parse(event.date, 'yyyy-MM-dd', new Date()), 'd') : ''}
                              </span>
                          </div>
                          <span className="font-display text-lg text-on-surface font-medium leading-tight">
                              {event.title}
                          </span>
                      </div>
                  ))
               ) : (
                  <div className="text-center py-6 text-on-surface-variant">
                      No upcoming events.
                  </div>
               )}
           </div>
        </div>
      </div>
    </div>
  );
}
