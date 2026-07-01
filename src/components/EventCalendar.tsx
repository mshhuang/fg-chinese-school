import React, { useState, useEffect, useMemo } from "react";
import { Calendar as CalendarIcon, Clock, MapPin, Loader2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { SchoolEvent, fetchSchoolEvents } from "../lib/events";
import { format, isSameDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, isSameMonth, isToday, parse } from "date-fns";
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
    Academic: "bg-blue-500/20 text-blue-200 border border-blue-500/30",
    Holiday: "bg-red-500/20 text-red-200 border border-red-500/30",
    Staff: "bg-purple-500/20 text-purple-200 border border-purple-500/30",
    Volunteer: "bg-orange-500/20 text-orange-200 border border-orange-500/30",
    Extracurricular: "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30",
    School: "bg-indigo-500/20 text-indigo-200 border border-indigo-500/30",
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
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
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
    <div className="w-full relative bg-[#0b132b] p-6 sm:p-8 rounded-[2rem] overflow-hidden shadow-2xl border border-blue-900/50">
      {/* Decorative background planets/stars */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-600/10 rounded-full blur-[80px] pointer-events-none z-0" />
      
      {/* CSS Planets */}
      <div className="absolute top-10 right-10 w-16 md:w-24 h-16 md:h-24 rounded-full shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.5)] bg-gradient-to-tr from-blue-600 to-cyan-300 pointer-events-none z-0 opacity-80" />
      <div className="absolute bottom-20 left-4 md:left-10 w-12 md:w-16 h-12 md:h-16 rounded-full shadow-[inset_-6px_-6px_12px_rgba(0,0,0,0.5)] bg-gradient-to-tr from-orange-500 to-yellow-300 pointer-events-none z-0 opacity-70" />
      <div className="absolute top-1/2 -right-4 md:-right-8 w-24 md:w-32 h-24 md:h-32 rounded-full shadow-[inset_-15px_-15px_30px_rgba(0,0,0,0.5)] bg-gradient-to-tr from-purple-600 to-pink-400 pointer-events-none z-0 opacity-60">
         {/* Planet Ring */}
         <div className="absolute top-1/2 left-1/2 w-32 md:w-48 h-6 md:h-8 border-y-4 border-white/20 rounded-[50%] -translate-x-1/2 -translate-y-1/2 rotate-[20deg]" />
      </div>
      <div className="absolute top-1/4 left-8 md:left-16 w-8 md:w-10 h-8 md:h-10 rounded-full shadow-[inset_-4px_-4px_8px_rgba(0,0,0,0.5)] bg-gradient-to-tr from-emerald-500 to-teal-300 pointer-events-none z-0 opacity-60" />
      <div className="absolute bottom-1/3 right-1/4 w-4 md:w-6 h-4 md:h-6 rounded-full shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.5)] bg-gradient-to-tr from-red-600 to-orange-400 pointer-events-none z-0 opacity-80" />
      
      {/* Stars */}
      <div className="absolute top-20 left-1/4 w-1 h-1 bg-white rounded-full blur-[1px] opacity-80 z-0 animate-pulse" />
      <div className="absolute top-40 right-1/3 w-1.5 h-1.5 bg-blue-200 rounded-full blur-[1px] opacity-60 z-0 animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-white rounded-full blur-[1px] opacity-90 z-0" />
      <div className="absolute bottom-10 left-1/3 w-2 h-2 bg-purple-200 rounded-full blur-[2px] opacity-50 z-0 animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-10 left-1/2 w-1.5 h-1.5 bg-white rounded-full blur-[1px] opacity-70 z-0 animate-pulse" style={{ animationDelay: '0.5s' }} />
      <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-100 rounded-full blur-[1px] opacity-80 z-0" />
      <div className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-yellow-100 rounded-full blur-[2px] opacity-40 z-0 animate-pulse" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-2/3 right-10 w-1 h-1 bg-white rounded-full blur-[1px] opacity-90 z-0" />
      <div className="absolute top-1/2 left-10 w-1.5 h-1.5 bg-pink-100 rounded-full blur-[1px] opacity-60 z-0 animate-pulse" style={{ animationDelay: '2.5s' }} />
      
      {/* More Stars */}
      <div className="absolute top-[15%] right-[15%] w-1 h-1 bg-white rounded-full blur-[0.5px] opacity-70 z-0 animate-pulse" style={{ animationDelay: '0.2s' }} />
      <div className="absolute bottom-[20%] right-[40%] w-1 h-1 bg-white rounded-full blur-[1px] opacity-50 z-0 animate-pulse" style={{ animationDelay: '1.2s' }} />
      <div className="absolute top-[60%] left-[20%] w-1.5 h-1.5 bg-blue-100 rounded-full blur-[1px] opacity-60 z-0 animate-pulse" style={{ animationDelay: '0.8s' }} />
      <div className="absolute top-[80%] left-[60%] w-2 h-2 bg-yellow-50 rounded-full blur-[1.5px] opacity-40 z-0 animate-pulse" style={{ animationDelay: '1.7s' }} />
      <div className="absolute top-[5%] left-[80%] w-1 h-1 bg-white rounded-full blur-[0.5px] opacity-90 z-0 animate-pulse" style={{ animationDelay: '2.1s' }} />
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
           <h3 className="font-display font-bold text-blue-50 text-2xl sm:text-3xl tracking-wide">
             {format(currentMonth, 'MMMM yyyy')}
           </h3>
           <div className="flex gap-2">
             <button onClick={handlePrevMonth} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-blue-200 transition-all hover:scale-105 active:scale-95 border border-white/5 backdrop-blur-sm">
               <ChevronLeft className="w-5 h-5" />
             </button>
             <button onClick={handleNextMonth} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-blue-200 transition-all hover:scale-105 active:scale-95 border border-white/5 backdrop-blur-sm">
               <ChevronRight className="w-5 h-5" />
             </button>
           </div>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-3">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} className="text-center font-label text-[11px] sm:text-xs uppercase font-bold text-blue-300/70 tracking-widest">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
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
                   "p-1.5 sm:p-2 min-h-[70px] sm:min-h-[100px] border rounded-xl sm:rounded-2xl flex flex-col items-end justify-start transition-all duration-300",
                   today ? "bg-blue-500/20 border-blue-400/50 shadow-[0_0_20px_rgba(59,130,246,0.2)]" : "bg-white/[0.03] border-white/10 hover:border-white/20",
                   !isCurrentMonth && "opacity-30",
                   hasEvents ? "cursor-pointer hover:bg-white/10 hover:shadow-lg hover:-translate-y-0.5" : "cursor-default"
                 )}
               >
                  <span className={cn(
                    "font-display text-xs sm:text-sm",
                    today ? "text-blue-100 font-bold bg-blue-500/40 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mt-0.5 mr-0.5 shadow-sm" : "text-blue-100/70 mt-1 mr-1"
                  )}>
                     {format(day, 'd')}
                  </span>
                  
                  {hasEvents && (
                    <div className="mt-2 flex flex-col gap-1 w-full overflow-hidden">
                       {dayEvents.slice(0, 3).map((e, i) => (
                         <div 
                           key={i} 
                           className={cn("w-full rounded-md px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold truncate backdrop-blur-sm", typeColors[e.type] || typeColors.School)} 
                           title={e.title}
                         >
                           {e.title}
                         </div>
                       ))}
                       {dayEvents.length > 3 && (
                         <div className="text-[10px] text-blue-300/70 font-medium text-center mt-1" title="More events">
                           +{dayEvents.length - 3}
                         </div>
                       )}
                    </div>
                  )}
               </div>
             );
           })}
        </div>
      </div>

      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050b14]/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-[#0b132b] w-full max-w-md rounded-[2rem] shadow-2xl shadow-blue-900/20 flex flex-col overflow-hidden relative border border-blue-800/40">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-[40px] pointer-events-none z-0" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full blur-[40px] pointer-events-none z-0" />
                <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none z-0" />
                <div className="flex justify-between items-center p-6 sm:p-8 border-b border-white/10 relative z-10">
                   <h2 className="font-display text-2xl sm:text-3xl font-bold text-blue-50 flex items-center gap-3">
                       <CalendarIcon className="w-7 h-7 text-blue-400" /> 
                       {format(selectedDate, 'MMM d, yyyy')}
                   </h2>
                   <button 
                       onClick={() => setSelectedDate(null)}
                       className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-blue-200 bg-white/5 border border-white/10"
                   >
                       <X className="w-5 h-5" />
                   </button>
                </div>
                <div className="p-6 sm:p-8 overflow-y-auto max-h-[60vh] flex flex-col gap-4 relative z-10 custom-scrollbar">
                   {selectedDayEvents.length > 0 ? (
                       selectedDayEvents.map((event, index) => (
                           <div key={`${event.id}-${index}`} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col hover:border-blue-500/40 hover:bg-white/10 transition-all duration-300 shadow-sm">
                             <div className="flex flex-col gap-2 mb-4">
                               <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-label font-bold w-fit uppercase tracking-wider", typeColors[event.type] || typeColors.School)}>
                                 {event.type}
                               </span>
                               <h3 className="font-display text-xl sm:text-2xl font-bold text-blue-50 leading-tight">{event.title}</h3>
                             </div>
                             
                             <div className="flex flex-col gap-2.5 mt-1 text-sm text-blue-200 font-body">
                               {(event.start_time || event.end_time) && (
                                 <div className="flex items-center gap-3 text-blue-300/90">
                                   <Clock className="w-4 h-4 shrink-0" />
                                   <span>
                                     {event.start_time} 
                                     {event.start_time && event.end_time && ' - '}
                                     {event.end_time}
                                   </span>
                                 </div>
                               )}
                               {event.location && (
                                 <div className="flex items-center gap-3 text-blue-300/90">
                                   <MapPin className="w-4 h-4 shrink-0" />
                                   <span>{event.location}</span>
                                 </div>
                               )}
                               {event.description && (
                                 <p className="mt-3 text-blue-100 bg-black/30 p-4 rounded-xl text-sm leading-relaxed border border-white/5 shadow-inner">
                                   {event.description}
                                 </p>
                               )}
                             </div>
                           </div>
                       ))
                   ) : (
                       <p className="text-blue-300/70 text-center py-8 font-medium">No events scheduled for this cosmic day.</p>
                   )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
