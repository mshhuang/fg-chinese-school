import { Calendar, CheckCircle2, Clock, MapPin, Megaphone, CheckSquare, Users, Building, ClipboardEdit, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function StaffDashboard() {
  const navigate = useNavigate();

  return (
    <div className="p-6 md:p-8 flex flex-col gap-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 gap-4">
        <div>
          <h1 className="font-display text-4xl text-on-surface font-bold tracking-tight mb-2">Staff & Volunteer Portal</h1>
          <p className="font-body text-on-surface-variant max-w-2xl text-lg">
            View your upcoming shifts, tasks, facility status, and daily reports.
          </p>
        </div>
        <button className="bg-primary hover:bg-primary/90 text-on-primary py-3 px-6 rounded-full font-label font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2">
           <CheckSquare className="w-4 h-4" /> Clock In
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="md:col-span-7 lg:col-span-8 flex flex-col gap-8">
          {/* Daily Reporting */}
          <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/30 shadow-[0_8px_30px_rgba(212,175,55,0.05)]">
            <h2 className="font-title text-2xl text-on-surface mb-6 font-bold flex items-center gap-3">
               <ClipboardEdit className="text-secondary w-6 h-6" /> 
               Daily Attendance Report
            </h2>
            <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/20">
               <p className="font-body text-sm text-on-surface-variant mb-6">
                 Submit the student headcount by class for today's morning assembly or homeroom check.
               </p>
               
               <div className="overflow-x-auto mb-6">
                 <table className="w-full text-left border-collapse min-w-[400px]">
                   <thead>
                     <tr className="border-b border-outline-variant/30">
                       <th className="pb-3 font-label text-xs font-bold text-on-surface uppercase tracking-wider w-1/3">Class</th>
                       <th className="pb-3 font-label text-xs font-bold text-on-surface uppercase tracking-wider">Present</th>
                       <th className="pb-3 font-label text-xs font-bold text-on-surface uppercase tracking-wider">Absent</th>
                     </tr>
                   </thead>
                   <tbody>
                     {[
                       "A100", "A200", "A300", "A400", "A500", "A600", "A700", "A800",
                       "P100", "P200", "P300", "P400", "P500", "P600", "P700", "P800"
                     ].map((cls) => (
                       <tr key={cls} className="border-b border-outline-variant/10 last:border-0">
                         <td className="py-3 font-title text-sm text-on-surface font-bold">
                           <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${cls.startsWith('A') ? 'bg-secondary' : 'bg-tertiary'}`}></div>
                             Class {cls}
                             {cls.startsWith('A') ? (
                               <span className="ml-1 px-1.5 py-0.5 bg-outline-variant/20 text-on-surface-variant text-[10px] rounded uppercase tracking-wider">Morning</span>
                             ) : (
                               <span className="ml-1 px-1.5 py-0.5 bg-outline-variant/20 text-on-surface-variant text-[10px] rounded uppercase tracking-wider">Afternoon</span>
                             )}
                           </div>
                         </td>
                         <td className="py-3 pr-4">
                            <input type="number" placeholder="0" className="w-full min-w-[70px] max-w-[120px] px-3 py-2 rounded-lg border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body text-sm bg-surface text-on-surface" />
                         </td>
                         <td className="py-3">
                            <input type="number" placeholder="0" className="w-full min-w-[70px] max-w-[120px] px-3 py-2 rounded-lg border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body text-sm bg-surface text-on-surface" />
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
               
               <div className="flex justify-end gap-3">
                 <button className="px-6 py-3 rounded-xl border border-outline-variant/50 font-label text-sm font-bold text-on-surface-variant hover:bg-surface-variant transition-colors">
                    Save Draft
                 </button>
                 <button className="bg-primary text-on-primary px-6 py-3 rounded-xl font-label text-sm font-bold shadow-sm hover:bg-primary/90 transition-colors">
                    Submit Report
                 </button>
               </div>
            </div>
          </div>

          {/* Facility Availability */}
          <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/30 shadow-[0_8px_30px_rgba(212,175,55,0.05)]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h2 className="font-title text-2xl text-on-surface font-bold flex items-center gap-3">
                 <Building className="text-secondary w-6 h-6" /> 
                 Classroom Availability
              </h2>
              <div className="flex items-center gap-3 font-body text-sm">
                 <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-secondary"></div> Free</span>
                 <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-error"></div> In Use</span>
                 <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-outline"></div> Maintenance</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { room: "Room 101", status: "In Use", time: "Until 11:30 AM", type: "error" },
                { room: "Room 102", status: "Free", time: "Available", type: "secondary" },
                { room: "Room 105 (Lab)", status: "In Use", time: "Until 2:00 PM", type: "error" },
                { room: "Room 201", status: "Free", time: "Available", type: "secondary" },
                { room: "Room 204", status: "Maintenance", time: "All Day", type: "outline" },
                { room: "Gymnasium", status: "Free", time: "Available", type: "secondary" },
              ].map((room, idx) => (
                <div key={idx} className="flex flex-col p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20">
                  <div className="flex justify-between items-start mb-2">
                     <span className="font-title font-bold text-on-surface">{room.room}</span>
                     <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${
                        room.type === 'secondary' ? 'bg-secondary' : 
                        room.type === 'error' ? 'bg-error' : 'bg-outline'
                     }`}></div>
                  </div>
                  <span className="font-body text-sm text-on-surface-variant mb-1">{room.status}</span>
                  <span className="font-caption text-xs text-outline font-bold uppercase tracking-wider">{room.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Shifts/Events */}
          <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/30 shadow-[0_8px_30px_rgba(212,175,55,0.05)]">
            <h2 className="font-title text-2xl text-on-surface mb-6 font-bold flex items-center gap-3">
               <Calendar className="text-secondary w-6 h-6" /> 
               Upcoming Shifts
            </h2>
            
            <div className="flex flex-col gap-4">
              {[
                { title: "Library Assistant", date: "Today", time: "10:00 AM - 2:00 PM", location: "Main Library", type: "Volunteer" },
                { title: "Lunch Supervision", date: "Tomorrow", time: "11:30 AM - 1:00 PM", location: "Cafeteria", type: "Staff" },
                { title: "Field Trip Chaperone", date: "Friday, May 29", time: "8:00 AM - 3:00 PM", location: "Science Museum", type: "Volunteer" }
              ].map((shift, idx) => (
                <div key={idx} className="flex flex-col md:flex-row justify-between items-start md:items-center bg-surface-container-low p-5 rounded-2xl border border-outline-variant/20 hover:border-primary-container/60 transition-colors">
                  <div className="flex flex-col gap-1 mb-4 md:mb-0">
                     <div className="flex items-center gap-2">
                        <span className="font-title font-bold text-on-surface text-lg">{shift.title}</span>
                        <span className="px-2 py-0.5 bg-primary-container/20 text-primary uppercase text-[10px] font-bold rounded-full tracking-wider">{shift.type}</span>
                     </div>
                     <div className="flex flex-wrap gap-4 font-body text-sm text-on-surface-variant">
                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {shift.date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {shift.time}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {shift.location}</span>
                     </div>
                  </div>
                  <button className="w-full md:w-auto px-4 py-2 border border-outline-variant/50 rounded-xl font-label text-sm font-bold text-on-surface-variant hover:bg-surface-variant transition-colors">
                     View Details
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Task List */}
          <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/30 shadow-[0_8px_30px_rgba(212,175,55,0.05)]">
            <h2 className="font-title text-2xl text-on-surface mb-6 font-bold flex items-center gap-3">
               <CheckSquare className="text-secondary w-6 h-6" /> 
               Assigned Tasks
            </h2>
            <div className="flex flex-col gap-3">
               <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant/20">
                  <CheckCircle2 className="w-6 h-6 text-outline hover:text-primary transition-colors cursor-pointer" />
                  <div className="flex-1">
                     <p className="font-label text-on-surface font-bold">Organize Book Fair Inventory</p>
                     <p className="font-body text-xs text-on-surface-variant mt-1">Due by EOD Today</p>
                  </div>
               </div>
               <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant/20">
                  <CheckCircle2 className="w-6 h-6 text-outline hover:text-primary transition-colors cursor-pointer" />
                  <div className="flex-1">
                     <p className="font-label text-on-surface font-bold">Prepare Art Supplies for Grade 3</p>
                     <p className="font-body text-xs text-on-surface-variant mt-1">Due Tomorrow, 9:00 AM</p>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="md:col-span-4 flex flex-col gap-8">
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
            </div>
          </div>

          {/* Announcements */}
          <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/30 shadow-[0_8px_30px_rgba(212,175,55,0.05)] h-full">
            <h2 className="font-title text-2xl text-on-surface mb-6 font-bold flex items-center gap-3">
               <Megaphone className="text-secondary w-6 h-6" /> 
               Announcements
            </h2>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                 <span className="font-caption text-xs uppercase tracking-widest text-primary font-bold">Today</span>
                 <h4 className="font-title font-bold text-on-surface text-base">New protocol for visitor sign-in</h4>
                 <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                   Please review the updated visitor management guidelines at the main office.
                 </p>
              </div>
              <div className="h-px bg-outline-variant/20 w-full" />
              <div className="flex flex-col gap-2">
                 <span className="font-caption text-xs uppercase tracking-widest text-tertiary font-bold">Yesterday</span>
                 <h4 className="font-title font-bold text-on-surface text-base">Volunteer Appreciation Lunch</h4>
                 <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                   Join us next Friday at noon in the main staff room.
                 </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
