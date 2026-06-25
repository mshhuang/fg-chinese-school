import React, { useState, useEffect } from "react";
import { Calendar, CheckCircle2, Clock, MapPin, Megaphone, CheckSquare, Users, Building, ClipboardEdit, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      let userId = null;
      let userRoles: string[] = [];
      if (userStr) {
        const u = JSON.parse(userStr);
        userId = u.user_id;
        userRoles = u.role_names || [];
      }

      // Fetch announcements. For simplicity, fetching all active ones where audience includes their role or is 'all'
      // Or just fetch latest 5 announcements for now
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
         console.warn("Could not fetch announcements:", error);
      } else {
         setAnnouncements(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }
    
    // Mock events
    const mockEvents: Record<number, { title: string, type: 'Staff' | 'Volunteer' }[]> = {
      12: [{ title: "Library Assistant", type: "Volunteer" }],
      15: [{ title: "Lunch Supervision", type: "Staff" }],
      22: [{ title: "Field Trip Chaperone", type: "Volunteer" }],
      28: [{ title: "Staff Meeting", type: "Staff" }]
    };

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = isCurrentMonth && today.getDate() === i;
      const hasEvents = mockEvents[i];

      days.push(
        <div key={i} className={`p-1 min-h-[60px] border border-outline-variant/10 rounded-lg flex flex-col items-center justify-start ${isToday ? 'bg-primary-container/20 border-primary/30' : 'bg-surface'}`}>
          <span className={`font-label text-xs ${isToday ? 'text-primary font-bold bg-primary/10 w-6 h-6 rounded-full flex items-center justify-center mt-1' : 'text-on-surface-variant mt-1.5'}`}>{i}</span>
          {hasEvents && (
             <div className="mt-1 flex flex-col gap-1 w-full px-1">
                {hasEvents.map((ev, idx) => (
                  <div key={idx} className={`w-full rounded px-1 py-0.5 text-[9px] font-bold truncate ${ev.type === 'Volunteer' ? 'bg-secondary-container text-on-secondary-container' : 'bg-tertiary-container text-on-tertiary-container'}`} title={ev.title}>
                    {ev.title}
                  </div>
                ))}
             </div>
          )}
        </div>
      );
    }

    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
           <h3 className="font-title font-bold text-on-surface text-lg">{monthName} {year}</h3>
           <div className="flex gap-2">
             <button onClick={prevMonth} className="p-1.5 rounded bg-surface-variant hover:bg-outline-variant/30 text-on-surface-variant transition-colors"><ChevronLeft className="w-4 h-4" /></button>
             <button onClick={nextMonth} className="p-1.5 rounded bg-surface-variant hover:bg-outline-variant/30 text-on-surface-variant transition-colors"><ChevronRight className="w-4 h-4" /></button>
           </div>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} className="text-center font-label text-[10px] uppercase font-bold text-outline tracking-wider">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8 flex flex-col gap-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 gap-4">
        <div>
          <h1 className="font-display text-4xl text-on-surface font-bold tracking-tight mb-2">Staff & Volunteer Portal</h1>
          <p className="font-body text-on-surface-variant max-w-2xl text-lg">
            View your upcoming shifts, events, and manage daily operations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="md:col-span-7 lg:col-span-8 flex flex-col gap-8">
          
          {/* Calendar & Upcoming Shifts */}
          <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/30 shadow-[0_8px_30px_rgba(212,175,55,0.05)]">
            <h2 className="font-title text-2xl text-on-surface mb-6 font-bold flex items-center gap-3">
               <Calendar className="text-secondary w-6 h-6" /> 
               Event Calendar & Shifts
            </h2>
            
            <div className="flex flex-col xl:flex-row gap-8">
               <div className="flex-1">
                 {renderCalendar()}
               </div>
               <div className="flex-1 flex flex-col gap-4">
                 <h3 className="font-label text-sm uppercase tracking-wider font-bold text-on-surface-variant mb-2">Upcoming</h3>
                  {[
                    { title: "Library Assistant", date: "Today, 10:00 AM", location: "Main Library", type: "Volunteer" },
                    { title: "Lunch Supervision", date: "Tomorrow, 11:30 AM", location: "Cafeteria", type: "Staff" },
                    { title: "Staff Meeting", date: "May 28, 3:00 PM", location: "Room 101", type: "Staff" }
                  ].map((shift, idx) => (
                    <div key={idx} className="flex flex-col bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20 hover:border-primary-container/60 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                         <span className="font-title font-bold text-on-surface text-base">{shift.title}</span>
                         <span className={`px-2 py-0.5 uppercase text-[10px] font-bold rounded-full tracking-wider ${shift.type === 'Volunteer' ? 'bg-secondary-container/50 text-secondary' : 'bg-tertiary-container/50 text-tertiary'}`}>{shift.type}</span>
                      </div>
                      <div className="flex flex-wrap gap-3 font-body text-xs text-on-surface-variant">
                         <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {shift.date}</span>
                         <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {shift.location}</span>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* Quick Actions / Portals */}
          <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/30 shadow-[0_8px_30px_rgba(212,175,55,0.05)]">
            <h2 className="font-title text-2xl text-on-surface mb-6 font-bold flex items-center gap-3">
               <Building className="text-secondary w-6 h-6" /> 
               Operations
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <button onClick={() => navigate('/staff/attendance')} className="flex flex-col items-start gap-4 p-6 bg-surface-container-low rounded-2xl border border-outline-variant/20 hover:border-primary transition-all group text-left">
                  <div className="bg-secondary/10 p-3 rounded-xl text-secondary group-hover:bg-secondary group-hover:text-on-primary transition-colors">
                     <ClipboardEdit className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-title text-lg font-bold text-on-surface">Daily Attendance</h4>
                    <p className="font-body text-sm text-on-surface-variant mt-1">Submit student headcount and reports</p>
                  </div>
               </button>
               <button onClick={() => navigate('/staff/availability')} className="flex flex-col items-start gap-4 p-6 bg-surface-container-low rounded-2xl border border-outline-variant/20 hover:border-primary transition-all group text-left">
                  <div className="bg-tertiary/10 p-3 rounded-xl text-tertiary group-hover:bg-tertiary group-hover:text-on-primary transition-colors">
                     <Building className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-title text-lg font-bold text-on-surface">Classroom Availability</h4>
                    <p className="font-body text-sm text-on-surface-variant mt-1">Check real-time facility status</p>
                  </div>
               </button>
            </div>
          </div>
          
        </div>

        {/* Right Column */}
        <div className="md:col-span-5 lg:col-span-4 flex flex-col gap-8">
          
          {/* Announcements */}
          <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/30 shadow-[0_8px_30px_rgba(212,175,55,0.05)] flex-1">
            <h2 className="font-title text-2xl text-on-surface mb-6 font-bold flex items-center gap-3">
               <Megaphone className="text-secondary w-6 h-6" /> 
               Announcements
            </h2>
            <div className="flex flex-col gap-4">
              {loading ? (
                <div className="animate-pulse flex flex-col gap-4">
                   <div className="h-20 bg-surface-container-high rounded-xl"></div>
                   <div className="h-20 bg-surface-container-high rounded-xl"></div>
                </div>
              ) : announcements.length > 0 ? (
                announcements.map((ann, idx) => (
                  <div key={ann.announcement_id} className="flex flex-col gap-2 pb-4 border-b border-outline-variant/20 last:border-0 last:pb-0">
                     <span className="font-caption text-xs uppercase tracking-widest text-primary font-bold">
                       {new Date(ann.created_at).toLocaleDateString()}
                     </span>
                     <h4 className="font-title font-bold text-on-surface text-base">{ann.title}</h4>
                     <p className="font-body text-sm text-on-surface-variant leading-relaxed line-clamp-3">
                       {ann.content}
                     </p>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-on-surface-variant flex flex-col items-center">
                   <Megaphone className="w-8 h-8 mb-3 opacity-20" />
                   <p className="font-body text-sm">No recent announcements.</p>
                </div>
              )}
              
              <button onClick={() => navigate('/staff/announcements')} className="mt-4 w-full py-3 bg-surface-container hover:bg-surface-variant text-on-surface font-label font-bold text-sm rounded-xl transition-colors border border-outline-variant/30">
                View All Announcements
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/30 shadow-[0_8px_30px_rgba(212,175,55,0.05)]">
            <h2 className="font-title text-2xl text-on-surface mb-6 font-bold flex items-center gap-3">
               <Users className="text-secondary w-6 h-6" /> 
               Quick Actions
            </h2>
            <div className="flex flex-col gap-3">
               <button onClick={() => navigate('/staff/new-user')} className="flex items-center gap-3 p-4 bg-surface-container-low rounded-xl border border-outline-variant/20 hover:border-primary transition-all group text-left">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                     <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-label font-bold text-on-surface">Add New User</h4>
                    <p className="font-body text-xs text-on-surface-variant mt-0.5">Register new students or staff</p>
                  </div>
               </button>
               <button onClick={() => navigate('/staff/messages')} className="flex items-center gap-3 p-4 bg-surface-container-low rounded-xl border border-outline-variant/20 hover:border-primary transition-all group text-left">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  </div>
                  <div>
                    <h4 className="font-label font-bold text-on-surface">Messages</h4>
                    <p className="font-body text-xs text-on-surface-variant mt-0.5">Contact staff and teachers</p>
                  </div>
               </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
