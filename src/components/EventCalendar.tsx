import React, { useState, useEffect, useMemo } from "react";
import { Calendar as CalendarIcon, Clock, MapPin, Loader2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { SchoolEvent, fetchSchoolEvents } from "../lib/events";
import { format, parseISO, isSameDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, isSameMonth, isToday, parse } from "date-fns";
import { cn } from "../lib/utils";

export const EventCalendar: React.FC<{ roleFilter?: string[] }> = ({ roleFilter }) => {
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    const data = await fetchSchoolEvents();
    // Filter events based on role if needed
    let filtered = data;
    if (roleFilter && roleFilter.length > 0) {
      filtered = data.filter(e => e.type === "School" || e.type === "Academic" || e.type === "Holiday" || roleFilter.includes(e.type));
    }
    
    // Sort by date
    filtered.sort((a, b) => {
       const dateA = a.date || '';
       const dateB = b.date || '';
       
       if (dateA !== dateB) {
           return dateA.localeCompare(dateB);
       }
       
       // Secondary sort by start_time string
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

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const parseDateLocal = (dateString: string) => {
    return parse(dateString, 'yyyy-MM-dd', new Date());
  };

  const selectedDayEvents = selectedDate 
    ? events.filter(e => e.date && isSameDay(parseDateLocal(e.date), selectedDate))
    : [];

  return (
    <div className="w-full relative">
      <div className="flex justify-between items-center mb-4">
         <h3 className="font-title font-bold text-on-surface text-lg">{format(currentMonth, 'MMMM yyyy')}</h3>
         <div className="flex gap-2">
           <button onClick={handlePrevMonth} className="p-1.5 rounded bg-surface-variant hover:bg-outline-variant/30 text-on-surface-variant transition-colors"><ChevronLeft className="w-4 h-4" /></button>
           <button onClick={handleNextMonth} className="p-1.5 rounded bg-surface-variant hover:bg-outline-variant/30 text-on-surface-variant transition-colors"><ChevronRight className="w-4 h-4" /></button>
         </div>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-center font-label text-[10px] uppercase font-bold text-outline tracking-wider">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
         {days.map((day, idx) => {
           const dayEvents = events.filter(e => e.date && isSameDay(parseDateLocal(e.date), day));
           const isCurrentMonth = isSameMonth(day, currentMonth);
           const today = isToday(day);
           const hasEvents = dayEvents.length > 0;

           return (
             <div 
               key={idx} 
               onClick={() => hasEvents && setSelectedDate(day)}
               className={cn(
                 "p-1 min-h-[60px] border rounded-lg flex flex-col items-center justify-start transition-colors",
                 today ? "bg-primary-container/20 border-primary/30" : "bg-surface border-outline-variant/10",
                 !isCurrentMonth && "opacity-40",
                 hasEvents ? "cursor-pointer hover:bg-surface-variant/30 hover:border-outline-variant/30" : "cursor-default"
               )}
             >
                <span className={cn(
                  "font-label text-xs",
                  today ? "text-primary font-bold bg-primary/10 w-6 h-6 rounded-full flex items-center justify-center mt-1" : "text-on-surface-variant mt-1.5"
                )}>
                   {format(day, 'd')}
                </span>
                
                {hasEvents && (
                  <div className="mt-1 flex flex-col gap-1 w-full px-1 overflow-hidden">
                     {dayEvents.slice(0, 3).map((e, i) => (
                       <div 
                         key={i} 
                         className={cn("w-full rounded px-1 py-0.5 text-[9px] font-bold truncate", typeColors[e.type] || typeColors.School)} 
                         title={e.title}
                       >
                         {e.title}
                       </div>
                     ))}
                     {dayEvents.length > 3 && (
                       <div className="text-[9px] text-on-surface-variant font-medium text-center" title="More events">
                         +{dayEvents.length - 3}
                       </div>
                     )}
                  </div>
                )}
             </div>
           );
         })}
      </div>

      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-surface w-full max-w-md rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
                <div className="flex justify-between items-center p-6 border-b border-outline-variant/20 bg-surface-container-lowest sticky top-0 z-10">
                   <h2 className="font-display text-2xl font-bold text-on-surface flex items-center gap-3">
                       <CalendarIcon className="w-6 h-6 text-primary" /> 
                       {format(selectedDate, 'MMMM d, yyyy')}
                   </h2>
                   <button 
                       onClick={() => setSelectedDate(null)}
                       className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-variant transition-colors text-on-surface-variant"
                   >
                       <X className="w-6 h-6" />
                   </button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[60vh] flex flex-col gap-4">
                   {selectedDayEvents.length > 0 ? (
                       selectedDayEvents.map((event, index) => (
                           <div key={`${event.id}-${index}`} className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-4 flex flex-col hover:border-primary/30 transition-colors shadow-sm">
                             <div className="flex flex-col gap-2 mb-3">
                               <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-label font-bold w-fit uppercase tracking-wider", typeColors[event.type] || typeColors.School)}>
                                 {event.type}
                               </span>
                               <h3 className="font-title text-lg font-bold text-on-surface">{event.title}</h3>
                             </div>
                             
                             <div className="flex flex-col gap-2 mt-1 text-sm text-on-surface-variant font-body">
                               {(event.start_time || event.end_time) && (
                                 <div className="flex items-center gap-2">
                                   <Clock className="w-4 h-4 text-primary" />
                                   <span>
                                     {event.start_time} 
                                     {event.start_time && event.end_time && ' - '}
                                     {event.end_time}
                                   </span>
                                 </div>
                               )}
                               {event.location && (
                                 <div className="flex items-center gap-2">
                                   <MapPin className="w-4 h-4 text-primary" />
                                   <span>{event.location}</span>
                                 </div>
                               )}
                               {event.description && (
                                 <p className="mt-2 text-on-surface bg-surface-variant/30 p-3 rounded-xl text-sm">
                                   {event.description}
                                 </p>
                               )}
                             </div>
                           </div>
                       ))
                   ) : (
                       <p className="text-on-surface-variant text-center py-4">No events for this date.</p>
                   )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
