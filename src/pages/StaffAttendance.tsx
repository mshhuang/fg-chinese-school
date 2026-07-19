import React, { useState, useEffect } from "react";
import { Search, Filter, Users, ClipboardCheck, ClipboardList, FileText, TrendingUp, DoorOpen, ChevronRight, CheckCircle2, User, Loader2, BookOpen } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useLocation, useNavigate } from "react-router-dom";
import { cn, formatTeacherName } from "../lib/utils";

export default function StaffAttendance() {
  const location = useLocation();
  const navigate = useNavigate();
  const stateClass = location.state?.class;

  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [clockIns, setClockIns] = useState<Record<string, 'checked_in' | 'checked_out' | 'not_checked_in'>>({});
  const [clockInTimes, setClockInTimes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(9);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }));
  const [coTeachersMap, setCoTeachersMap] = useState<Record<string, any>>({});

  useEffect(() => {
    const init = async () => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const parsedUser = JSON.parse(userStr);
          
          let query = supabase.from('classes').select('*, users:primary_teacher_id(first_name, last_name), co_teacher:co_teacher_id(first_name, last_name)').order('class_name');
          
          const { data: roles } = await supabase.from('user_roles')
            .select('roles(role_name)')
            .eq('user_id', parsedUser.id);
            
          const isTeacher = roles?.some((r: any) => r.roles?.role_name === 'Teacher');
          if (isTeacher) {
             // Fetch classes where user is primary teacher, legacy co-teacher, or in the co_teachers array
             query = query.or(`primary_teacher_id.eq.${parsedUser.id},co_teacher_id.eq.${parsedUser.id},co_teachers.cs.{${parsedUser.id}}`);
          }
          
          const { data, error } = await query;
          if (!error && data) {
            setClasses(data);
            // Fetch users for co_teachers array
            const coTeacherIds = new Set<string>();
            data.forEach((c: any) => {
               if (c.co_teachers) {
                   c.co_teachers.forEach((id: string) => coTeacherIds.add(id));
               }
            });
            if (coTeacherIds.size > 0) {
               supabase.from('users').select('user_id, first_name, last_name').in('user_id', Array.from(coTeacherIds)).then(({data: usersData}) => {
                   if (usersData) {
                      const map: Record<string, any> = {};
                      usersData.forEach((u: any) => map[u.user_id] = u);
                      setCoTeachersMap(map);
                   }
               });
            }
            if (data.length > 0 && !stateClass) {
              handleSelectClass(data[0]);
            }
          }
        } catch (e) {}
      }
      setLoading(false);
      
      if (stateClass) {
        handleSelectClass(stateClass);
      }
    };
    init();
  }, [stateClass]);

    const handleSelectClass = async (cls: any) => {
    setSelectedClass(cls);
    setStudentsLoading(true);
    setAttendance({});
    setClockIns({});
    
    // Fetch today's actual school clock in status from database
    const [year, month, day] = attendanceDate.split('-').map(Number);
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
    
    const { data: clockInData } = await supabase.from('student_clock_ins')
       .select('student_id, action_type, created_at')
       .gte('created_at', startOfDay.toISOString())
       .lte('created_at', endOfDay.toISOString())
       .order('created_at', { ascending: false });
       
    const cMap: Record<string, 'checked_in' | 'checked_out' | 'not_checked_in'> = {};
    const tMap: Record<string, string> = {};
    if (clockInData) {
       clockInData.forEach(r => {
          if (cMap[r.student_id] === undefined) {
             cMap[r.student_id] = r.action_type === 'school_check_in' ? 'checked_in' : 'checked_out';
             tMap[r.student_id] = r.created_at;
          }
       });
    }
    setClockIns(cMap);
    setClockInTimes(tMap);
    
    let currentStudents: any[] = [];
    const { data: enrollData, error } = await supabase.from("enrollments").select("student_id").eq("class_id", cls.class_id);
    console.log("DEBUG StaffAttendance enrollments fetch:", enrollData, error, cls.class_id);
    if (!error && enrollData && enrollData.length > 0) {
       const studentIds = enrollData.map((e: any) => e.student_id).filter(Boolean);
       console.log("DEBUG studentIds:", studentIds);
       if (studentIds.length > 0) {
         const { data: usersData } = await supabase.from("users").select("user_id, first_name, last_name").in("user_id", studentIds);
         console.log("DEBUG usersData:", usersData);

         if (usersData) {
            currentStudents = usersData.map((u: any) => ({
               student_id: u.user_id,
               first_name: u.first_name || "Unknown",
               last_name: u.last_name || "Student",
               avatar_url: null
            })).sort((a: any, b: any) => a.last_name.localeCompare(b.last_name));
            setStudents(currentStudents);
         } else { setStudents([]); }
       } else { setStudents([]); }
    } else { setStudents([]); }
    
    // Mock attendance for visual demo, or fetch real
    const { data: existing } = await supabase.from('attendance')
       .select('student_id, status')
       .eq('class_id', cls.class_id)
       .eq('attendance_date', attendanceDate);
       
    if (existing && existing.length > 0) {
       const attMap: Record<string, string> = {};
       existing.forEach(r => {
          if (r.student_id && r.status !== null) {
             attMap[r.student_id] = r.status;
          }
       });
       setAttendance(attMap);
    } else {
       // Default real values based on actual school building check-ins!
       const initMap: Record<string, string> = {};
       currentStudents.forEach((s) => {
          if (s.student_id) {
             const cStatus = cMap[s.student_id] || 'not_checked_in';
             if (cStatus === 'checked_in') {
                initMap[s.student_id] = 'Present';
             } else if (cStatus === 'checked_out') {
                initMap[s.student_id] = 'Checked Out';
             } else {
                initMap[s.student_id] = 'Not Arrived';
             }
          }
       });
       setAttendance(initMap);
    }
    setStudentsLoading(false);
  };

  if (loading) {
     return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!loading && classes.length === 0) {
     return (
       <div className="p-6 md:p-8 w-full max-w-7xl mx-auto flex flex-col items-center justify-center pb-32 md:pb-8 min-h-[60vh]">
          <div className="bg-surface-container-low p-12 rounded-3xl border border-outline-variant/30 text-center flex flex-col items-center max-w-lg">
             <div className="w-16 h-16 rounded-full bg-surface-variant flex items-center justify-center mb-6">
                <BookOpen className="w-8 h-8 text-on-surface-variant/50" />
             </div>
             <h2 className="text-2xl font-display font-bold text-on-surface mb-4">No Classes Assigned</h2>
             <p className="text-on-surface-variant font-body">You are not currently assigned as a primary or co-teacher for any classes. If you believe this is an error, please contact the administration.</p>
          </div>
       </div>
     );
  }

  return (
    <div className="p-6 md:p-8 w-full max-w-7xl mx-auto flex flex-col items-center pb-32 md:pb-8">
      <div className="w-full max-w-5xl">
        {/* Top Tabs */}
        <div className="flex gap-3 mb-10 overflow-x-auto hide-scrollbar pb-2">
          {classes.map(cls => {
             const isSelected = selectedClass?.class_id === cls.class_id;
             return (
               <button
                 key={cls.class_id}
                 onClick={() => handleSelectClass(cls)}
                 className={cn(
                   "px-8 py-2.5 rounded-full font-label font-bold text-sm transition-all whitespace-nowrap",
                   isSelected 
                     ? "bg-primary text-white shadow-sm" 
                     : "bg-white border border-outline-variant/30 text-on-surface-variant hover:bg-surface"
                 )}
               >
                 {cls.class_name}
               </button>
             );
          })}
        </div>

        {selectedClass && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Area */}
            <div className="mb-10">
               <h1 className="text-4xl md:text-5xl font-bold font-display text-primary mb-4 tracking-tight">
                 {selectedClass.class_name}
               </h1>
               
               <div className="flex items-center gap-6 text-sm font-label font-bold text-on-surface-variant mb-6">
                 <div className="flex items-center gap-2">
                   <DoorOpen className="w-4 h-4 text-secondary" />
                   Room {selectedClass.room_number || "TBD"}
                 </div>
                 <div className="flex items-center gap-2">
                   <Users className="w-4 h-4 text-secondary" />
                   {students.length} Students
                 </div>
               </div>

               {/* Teaching Team */}
               <div className="inline-flex items-center gap-4 bg-white border border-outline-variant/30 rounded-full p-2 pr-6 shadow-sm">
                 <div className="flex items-center gap-2 text-sm font-label px-3">
                    <User className="w-4 h-4 text-primary" />
                    <span className="font-bold text-primary">Teaching Team</span>
                 </div>
                 <div className="flex items-center gap-2 text-sm bg-surface-container-lowest border border-outline-variant/30 rounded-full px-4 py-1.5">
                    <User className="w-3.5 h-3.5 text-on-surface-variant" />
                    <span className="font-bold text-on-surface-variant">Lead:</span> 
                    <span>{formatTeacherName(selectedClass.users?.first_name, selectedClass.users?.last_name, "Teacher")}</span>
                 </div>
                 <div className="flex items-center gap-2 text-sm bg-surface-container-lowest border border-outline-variant/30 rounded-full px-4 py-1.5">
                    <User className="w-3.5 h-3.5 text-on-surface-variant" />
                                        <span className="font-bold text-on-surface-variant">Co-Teacher:</span> 
                    <span>
                       {(() => {
                          const allCoTeachers = [
                             ...(selectedClass.co_teacher_id && !(selectedClass.co_teachers || []).includes(selectedClass.co_teacher_id) ? [selectedClass.co_teacher_id] : []),
                             ...(selectedClass.co_teachers || [])
                          ];
                          if (allCoTeachers.length === 0) return 'TBD';
                          
                                                    return allCoTeachers.map(id => {
                             // try to check if it's the current user
                             const userStr = localStorage.getItem("user");
                             if (userStr) {
                                try {
                                    const parsedUser = JSON.parse(userStr);
                                    if (id === parsedUser.id) return `You (${formatTeacherName(parsedUser.first_name, parsedUser.last_name, "Teacher")})`;
                                } catch (e) {}
                             }
                             
                             if (id === selectedClass.co_teacher_id && selectedClass.co_teacher) {
                                 return formatTeacherName(selectedClass.co_teacher.first_name, selectedClass.co_teacher.last_name, "Teacher");
                             }
                             const u = coTeachersMap[id];
                             if (u) return formatTeacherName(u.first_name, u.last_name, "Teacher");
                             
                             return 'Unknown';
                          }).join(', ');
                       })()}
                    </span>
                 </div>
               </div>
            </div>

            {/* Management Tools */}
            <div className="mb-12">
               <div className="flex items-center gap-2 font-bold text-primary mb-4">
                  <div className="w-5 h-5 border-[2px] border-dashed border-primary rounded-md flex items-center justify-center opacity-70">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  </div>
                  Management Tools
               </div>
               <div className="flex flex-wrap gap-4">
                 <ToolCard 
                    icon={<ClipboardCheck className="w-6 h-6 text-primary" />} 
                    title="Attendance" 
                    subtitle="Track & View Sheets" 
                    onClick={() => navigate('/teacher/attendance-sheet')}
                 />
                 <ToolCard 
                    icon={<ClipboardList className="w-6 h-6 text-secondary" />} 
                    title="Assignments" 
                    subtitle="Manage Tasks" 
                    onClick={() => navigate('/teacher/assignments')}
                 />
                 <ToolCard 
                    icon={<FileText className="w-6 h-6 text-tertiary" />} 
                    title="Class Notes" 
                    subtitle="Observations" 
                 />
                 <ToolCard 
                    icon={<TrendingUp className="w-6 h-6 text-primary" />} 
                    title="Performance" 
                    subtitle="Class Metrics" 
                 />
               </div>
            </div>

            {/* Student Roster */}
            <div>
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                 <div className="flex items-center gap-2 font-bold text-primary">
                    <Users className="w-5 h-5" />
                    Student Roster
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="relative flex items-center bg-surface border border-outline-variant/30 rounded-full px-4 py-2 w-64 focus-within:border-primary focus-within:bg-white transition-colors">
                       <Search className="w-4 h-4 text-on-surface-variant mr-2" />
                       <input 
                         type="text" 
                         placeholder="Search students..." 
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         className="bg-transparent border-none outline-none text-sm w-full placeholder-[#8A8476] text-on-surface-variant"
                       />
                    </div>
                    <button className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center hover:bg-secondary/90 transition-colors shadow-sm">
                       <Filter className="w-4 h-4" />
                    </button>
                 </div>
               </div>

               {studentsLoading ? (
                  <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-on-surface-variant" /></div>
               ) : (
                  <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 w-full">
                       {(() => {
                          const filteredStudents = students.filter(s => s.first_name.toLowerCase().includes(searchQuery.toLowerCase()) || s.last_name.toLowerCase().includes(searchQuery.toLowerCase()));
                          return (
                            <>
                              {filteredStudents.slice(0, visibleCount).map(student => {
                                 const status = attendance[student.student_id] || 'Not Arrived';
                                 const cStatus = clockIns[student.student_id] || 'not_checked_in';
                                 
                                 let displayStatus = status;
                                 let statusColor = 'bg-[#78909C]'; // default slate-gray

                                 if (status === 'Present') {
                                    if (clockInTimes[student.student_id]) {
                                       const d = new Date(clockInTimes[student.student_id]);
                                       const timeStr = d.toLocaleTimeString('en-US', { timeZone: 'America/New_York',  hour: 'numeric', minute: '2-digit' , timeZoneName: 'short'});
                                       const dateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
                                       displayStatus = `${student.first_name} arrived at school at ${timeStr} on ${dateStr}`;
                                    } else {
                                       displayStatus = 'Present (In School)';
                                    }
                                    statusColor = 'bg-[#2E7D32]'; // Green
                                 } else if (status === 'Checked Out') {
                                    displayStatus = 'Checked Out (Left School)';
                                    statusColor = 'bg-[#E65100]'; // Orange
                                 } else if (status === 'Absent') {
                                    displayStatus = 'Absent';
                                    statusColor = 'bg-[#D32F2F]'; // Red
                                 } else if (status === 'Not Arrived') {
                                    displayStatus = 'Not Arrived';
                                    statusColor = 'bg-[#78909C]'; // slate gray
                                 } else if (status === 'Late') {
                                    displayStatus = 'Late';
                                    statusColor = 'bg-[#FBC02D]'; // Yellow
                                 } else if (status === 'Excused') {
                                    displayStatus = 'Excused';
                                    statusColor = 'bg-[#0288D1]'; // Blue
                                 }
                                 
                                 return (
                                   <div key={student.student_id} className="w-full bg-white border border-primary/50 rounded-full p-2.5 flex items-center justify-between hover:shadow-md hover:border-primary transition-all cursor-pointer group">
                                      <div className="flex items-center gap-5">
                                         <div className="w-16 h-16 rounded-full overflow-hidden bg-white border-[3px] border-primary/50 shrink-0 p-0.5">
                                            {student.avatar_url ? (
                                               <img src={student.avatar_url} alt={student.first_name} className="w-full h-full object-cover rounded-full" />
                                            ) : (
                                               <div className="w-full h-full flex items-center justify-center text-on-surface-variant font-bold text-xl rounded-full bg-surface">
                                                  {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                                               </div>
                                            )}
                                         </div>
                                         <div className="flex flex-col justify-center">
                                            <span className="font-bold text-on-surface text-lg group-hover:text-primary transition-colors">
                                               {student.first_name} {student.last_name}
                                            </span>
                                            <div className="flex items-center gap-2 mt-1">
                                              <div className={`w-2.5 h-2.5 rounded-full ${statusColor}`} />
                                              <span className="font-label text-sm text-on-surface-variant font-medium">{displayStatus}</span>
                                            </div>
                                         </div>
                                      </div>
                                      <button className="w-10 h-10 rounded-full border border-primary/50 flex items-center justify-center mr-3 text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                                         <ChevronRight className="w-5 h-5" />
                                       </button>
                                   </div>
                                 );
                              })}
                              
                              {filteredStudents.length > visibleCount && (
                                <div className="flex justify-center mt-4 w-full">
                                   <button onClick={() => setVisibleCount(prev => prev + 9)} className="px-8 py-3 rounded-full border border-primary text-primary font-bold font-label hover:bg-primary hover:text-white transition-colors">
                                      Load More Students
                                   </button>
                                </div>
                              )}
                            </>
                          );
                       })()}
                    </div>
                  </>
               )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ToolCard({ icon, title, subtitle, onClick }: { icon: React.ReactNode, title: string, subtitle: string, onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex-1 min-w-[180px] bg-surface-container-low rounded-3xl p-6 flex flex-col items-center justify-center text-center hover:-translate-y-1 hover:shadow-md transition-all border border-transparent hover:border-primary/30 group">
       <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
         {icon}
       </div>
       <span className="font-bold text-on-surface mb-1">{title}</span>
       <span className="text-xs font-label text-on-surface-variant">{subtitle}</span>
    </button>
  );
}
