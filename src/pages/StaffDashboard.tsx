import React, { useState, useEffect } from "react";
import { Calendar, CheckCircle2, Clock, MapPin, Megaphone, CheckSquare, Users, Building, ClipboardEdit, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchVisibleAnnouncements } from "../lib/announcementUtils";
import { supabase } from "../lib/supabase";
import { DashboardNotifications } from "../components/DashboardNotifications";

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
      const data = await fetchVisibleAnnouncements(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null, localStorage.getItem('current_role') || 'staff', 5);
      setAnnouncements(data || []);
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

  return (
    <div className="p-6 md:p-8 flex flex-col gap-8 max-w-7xl mx-auto w-full">
      <DashboardNotifications />
      {/* Announcement Headline */}
      {announcements.length > 0 && !loading && (
        <div 
          onClick={() => navigate('/staff/announcements')}
          className="bg-primary-container text-on-primary-container p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-primary/20 transition-colors border border-primary/20 shadow-sm"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <Megaphone className="w-5 h-5 shrink-0 text-primary" />
            <div className="truncate">
              <span className="font-bold mr-2">New Announcement:</span>
              <span className="font-body text-sm truncate">{announcements[0].title}</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 shrink-0 opacity-70" />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 gap-4">
        <div>
          <h1 className="font-display text-4xl text-on-surface font-bold tracking-tight mb-2">Staff Portal</h1>
          <p className="font-body text-on-surface-variant max-w-2xl text-lg">
            View your upcoming shifts, events, and manage daily operations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="md:col-span-7 lg:col-span-8 flex flex-col gap-8">
          
          {/* Quick Actions / Portals */}
          <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/30 shadow-[0_8px_30px_rgba(212,175,55,0.05)]">
            <h2 className="font-title text-2xl text-on-surface mb-6 font-bold flex items-center gap-3">
               <Building className="text-secondary w-6 h-6" /> 
               Operations
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <button onClick={() => {}} className="flex flex-col items-start gap-4 p-6 bg-surface-container-low rounded-2xl border border-outline-variant/20 transition-all text-left opacity-50 grayscale pointer-events-none cursor-not-allowed">
                  <div className="bg-secondary/10 p-3 rounded-xl text-secondary">
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
