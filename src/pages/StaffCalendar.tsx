import { useState, useEffect } from "react";
import { EventCalendar } from "../components/EventCalendar";
import { Calendar, Clock, MapPin, Loader2 } from "lucide-react";
import { SchoolEvent, fetchSchoolEvents } from "../lib/events";
import { format, parse } from "date-fns";
import { cn } from "../lib/utils";

export default function StaffCalendar() {
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    const data = await fetchSchoolEvents();
    const roleFilter = ["Staff", "School", "Holiday"];
    const filtered = data.filter(e => roleFilter.includes(e.type));
    
    filtered.sort((a, b) => {
       const dateA = new Date(a.date + 'T' + a.start_time);
       const dateB = new Date(b.date + 'T' + b.start_time);
       return dateA.getTime() - dateB.getTime();
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
          <h1 className="font-display text-4xl text-primary font-bold tracking-tight">Staff Calendar</h1>
          <p className="font-body text-lg text-on-surface-variant mt-2">View upcoming events, shifts, and school activities.</p>
        </div>
      </header>

      <div className="bg-surface-container-lowest rounded-3xl border border-surface-variant p-6 md:p-8 shadow-[0_4px_20px_rgba(212,175,55,0.05)] flex flex-col gap-6">
        <h3 className="font-title text-xl text-on-surface flex items-center gap-3 font-bold mb-2">
           <Calendar className="text-primary w-6 h-6" /> Event Calendar
        </h3>
        <EventCalendar roleFilter={["Staff", "School", "Holiday"]} />
      </div>

      <div className="flex flex-col gap-6 mt-4">
        <h2 className="font-display text-2xl font-bold text-on-surface">Upcoming Events</h2>
        {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 bg-surface-container-low rounded-3xl border border-outline-variant/30">
           <Calendar className="w-12 h-12 text-on-surface-variant/50 mx-auto mb-4" />
           <h3 className="font-title text-xl font-bold text-on-surface">No upcoming events</h3>
           <p className="font-body text-on-surface-variant mt-2">There are no events scheduled.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-6 flex flex-col hover:border-primary/30 transition-colors shadow-sm">
              <div className="flex flex-col gap-2 mb-4">
                <span className={cn("px-3 py-1 rounded-full text-xs font-label font-bold w-fit", typeColors[event.type] || typeColors.School)}>
                  {event.type}
                </span>
                <h3 className="font-title text-xl font-bold text-on-surface">{event.title}</h3>
              </div>
              
              <div className="flex flex-col gap-3 mt-2 text-sm text-on-surface-variant font-body">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>{event.date ? format(parse(event.date, 'yyyy-MM-dd', new Date()), 'EEEE, MMMM d, yyyy') : 'Unknown Date'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-secondary" />
                  <span>{event.start_time} - {event.end_time}</span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-tertiary" />
                    <span>{event.location}</span>
                  </div>
                )}
                {event.description && (
                  <p className="mt-2 text-on-surface bg-surface-variant/30 p-3 rounded-xl">
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
