import React, { useState, useEffect } from "react";
import { Search, Filter, Users, BookOpen, Clock, X, ArrowRight, Calendar, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { cn, formatTeacherName } from "../lib/utils";

export default function TeacherClasses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [classesData, setClassesData] = useState<any[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'my_classes' | 'all_classes'>('my_classes');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  
  const [schoolScheduleUrl, setSchoolScheduleUrl] = useState<string | null>(null);
  const [schoolScheduleModalOpen, setSchoolScheduleModalOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
       setLoading(true);
       const userStr = localStorage.getItem('user');
       if (!userStr) {
         setLoading(false);
         return;
       }
       const u = JSON.parse(userStr);
       if (!u || !u.id || u.id === 'demo') {
         setLoading(false);
         return;
       }
       
       setCurrentUserId(u.id);

       // Fetch ALL classes, so teachers can view/assign homework to any class if they are a co-teacher
       const { data: userData } = await supabase.from('users').select('user_id, first_name, last_name, user_roles(roles(role_name))');
       const uMap: Record<string, any> = {};
       if (userData) {
          userData.forEach((user: any) => {
             const isVolunteer = user.user_roles?.some((ur: any) => ur.roles?.role_name === 'Volunteer');
             uMap[user.user_id] = { ...user, isVolunteer };
          });
          setUsersMap(uMap);
       }
       
       const { data: settingsData } = await supabase.from('announcements').select('*').eq('title', 'SYSTEM_SCHOOL_SCHEDULE_URL').single();
       if (settingsData && settingsData.content) {
          setSchoolScheduleUrl(settingsData.content);
       }
       
       const { data: clsData } = await supabase.from('classes').select('*, enrollments(count), users:primary_teacher_id(first_name, last_name), co_teacher:co_teacher_id(first_name, last_name), co_teachers');
       
       if (clsData) {
         setClassesData(clsData);
       }
       
       setLoading(false);
    }
    fetchData();
  }, []);


  const filteredClasses = classesData.filter(c => {
    if (viewMode === 'my_classes' && c.primary_teacher_id !== currentUserId && c.co_teacher_id !== currentUserId && !(c.co_teachers || []).includes(currentUserId)) return false;
    return c.class_name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="w-full max-w-[1600px] mx-auto p-6 md:p-8 flex flex-col gap-8 pb-32 md:pb-8">
       {/* Header */}
       <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div>
           <h1 className="font-display text-4xl text-primary font-bold tracking-tight">Classes</h1>
           <p className="font-body text-lg text-on-surface-variant mt-2">Manage your classes and students.</p>
         </div>
       </header>

       {/* Toolbar */}
       <div className="flex flex-col xl:flex-row justify-between gap-6">
          <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar w-full xl:w-auto">
             <button
               onClick={() => setViewMode('my_classes')}
               className={cn(
                 "whitespace-nowrap px-6 py-2.5 rounded-full font-label text-sm transition-all border font-bold shrink-0",
                 viewMode === 'my_classes' 
                   ? "bg-primary-container text-on-primary-container border-primary-container shadow-sm" 
                   : "bg-surface text-on-surface-variant border-outline-variant/40 hover:bg-surface-variant/50"
               )}
             >
                My Classes
             </button>
             <button
               onClick={() => setViewMode('all_classes')}
               className={cn(
                 "whitespace-nowrap px-6 py-2.5 rounded-full font-label text-sm transition-all border font-bold shrink-0",
                 viewMode === 'all_classes' 
                   ? "bg-primary-container text-on-primary-container border-primary-container shadow-sm" 
                   : "bg-surface text-on-surface-variant border-outline-variant/40 hover:bg-surface-variant/50"
               )}
             >
                All Classes
             </button>
             <button
               onClick={() => setSchoolScheduleModalOpen(true)}
               className="whitespace-nowrap px-6 py-2.5 rounded-full font-label text-sm transition-all border font-bold shrink-0 bg-surface text-on-surface-variant border-outline-variant/40 hover:bg-surface-variant/50 flex items-center gap-2"
             >
                <Calendar className="w-4 h-4" />
                School Schedule
             </button>
          </div>

          <div className="flex items-center gap-3 bg-surface-container-low rounded-full px-4 py-2 border border-outline-variant/40 shrink-0 w-full xl:w-80 shadow-sm focus-within:border-primary/50 transition-colors">
             <Search className="w-5 h-5 text-on-surface-variant" />
             <input 
               type="text" 
               placeholder="Search classes..." 
               className="bg-transparent border-none outline-none font-body text-sm w-full"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
             <button className="p-1.5 text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors">
               <Filter className="w-4 h-4" />
             </button>
          </div>
       </div>

       {/* List / Grid */}
       {loading ? (
          <div className="flex items-center justify-center p-12">
             <div className="w-8 h-8 animate-spin text-primary border-4 border-primary border-t-transparent rounded-full" />
          </div>
       ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-6 gap-4">
             {filteredClasses.map(cls => (
                <div key={cls.class_id} className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-6 flex flex-col hover:shadow-md transition-all shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                       <div className="flex flex-col gap-2">
                           <h3 className="font-display text-2xl font-bold text-on-surface">{cls.class_name}</h3>
                           <span className={cn(
                              "self-start px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-label",
                              cls.primary_teacher_id === currentUserId 
                                  ? "bg-primary-container text-on-primary-container"
                                  : "bg-secondary-container text-on-secondary-container"
                           )}>
                              {cls.primary_teacher_id === currentUserId ? "Homeroom Teacher" : "Co-Teacher"}
                           </span>
                       </div>
                       <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-label bg-primary-container/20 text-primary border border-primary/20">
                          Active
                       </span>
                    </div>

                    <div className="flex flex-col gap-3 mb-6">
                       <div className="flex flex-col gap-1 mb-2 p-3 rounded-xl bg-surface-variant/30 border border-outline-variant/30">
                          <div className="text-sm">
                             <span className="font-bold text-on-surface-variant">Homeroom: </span>
                             <span className="text-on-surface font-medium">{formatTeacherName(cls.users?.first_name, cls.users?.last_name, 'Teacher')}</span>
                          </div>
                                                    <div className="text-sm">
                            <span className="font-bold text-on-surface-variant">Co-Teacher: </span>
                            <span className="text-on-surface font-medium">
                               {(() => {
                                  const allCoTeachers = [
                                     ...(cls.co_teacher_id && !(cls.co_teachers || []).includes(cls.co_teacher_id) ? [cls.co_teacher_id] : []),
                                     ...(cls.co_teachers || [])
                                  ];
                                  if (allCoTeachers.length === 0) return 'TBD';
                                  
                                  return allCoTeachers.map(id => {
                                     if (id === currentUserId) {
                                         const u = usersMap[id];
                                         if (u) return `You (${formatTeacherName(u.first_name, u.last_name, 'Teacher')})`;
                                         return "You";
                                     }
                                     const u = usersMap[id];
                                     if (!u) {
                                         if (id === cls.co_teacher_id && cls.co_teacher) {
                                             return formatTeacherName(cls.co_teacher.first_name, cls.co_teacher.last_name, 'Teacher');
                                         }
                                         return 'Unknown';
                                     }
                                     if (u.isVolunteer) return `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Volunteer';
                                     return formatTeacherName(u.first_name, u.last_name, 'Teacher');
                                  }).join(', ');
                               })()}
                            </span>
                          </div>
                       </div>
                       <div className="flex items-center gap-3 text-on-surface-variant">
                         <Clock className="w-4 h-4 shrink-0" />
                         <span className="font-body text-sm">Schedule TBD</span>
                       </div>
                       <div className="flex items-center gap-3 text-on-surface-variant">
                         <BuildingIcon className="w-4 h-4 shrink-0" />
                         <span className="font-body text-sm">Room TBD</span>
                       </div>
                    </div>

                    {cls.schedule_image_url && (
                      <div className="mb-6 rounded-xl overflow-hidden border border-outline-variant/30 flex items-center justify-center bg-surface-variant/30 relative cursor-pointer" style={{ minHeight: '120px' }} onClick={() => setEnlargedImage(cls.schedule_image_url)}>
                         <img src={cls.schedule_image_url} alt="Schedule" className="object-contain w-full h-auto hover:scale-[1.02] transition-transform duration-300" referrerPolicy="no-referrer" />
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20 mt-auto">
                       <div className="flex items-center gap-2 text-on-surface-variant">
                          <Users className="w-4 h-4 shrink-0" />
                          <span className="font-label text-sm font-bold">{cls.enrollments?.[0]?.count || 0} Students Enrolled</span>
                       </div>
                       <div className="flex items-center gap-4">
                          {cls.primary_teacher_id === currentUserId && (
                             <button onClick={() => navigate('/teacher/attendance', { state: { class: cls } })} className="text-secondary font-label text-sm font-bold flex items-center gap-1 hover:underline">
                               Attendance
                             </button>
                          )}
                          <button onClick={() => navigate('/teacher/assignments?classId=' + cls.class_id)} className="text-primary font-label text-sm font-bold flex items-center gap-1 hover:underline">
                            Assign Homework <ArrowRight className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                </div>
             ))}

             {filteredClasses.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center p-12 bg-surface-container-low border border-dashed border-outline-variant/40 rounded-3xl text-center">
                   <BookOpen className="w-12 h-12 text-on-surface-variant opacity-50 mb-4" />
                   <p className="font-display text-2xl font-bold text-on-surface mb-2">No Classes Assigned</p>
                   <p className="font-body text-on-surface-variant max-w-md">You are not currently assigned as a primary or co-teacher for any classes. If you believe this is an error, please contact the administration.</p>
                </div>
             )}
          </div>
       )}

       {enlargedImage && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setEnlargedImage(null)}>
             <img src={enlargedImage} className="max-w-full max-h-full object-contain rounded-lg" alt="Enlarged schedule" />
             <button className="absolute top-6 right-6 text-white bg-black/50 p-2 rounded-full hover:bg-black/80 transition-colors cursor-pointer" onClick={() => setEnlargedImage(null)}>
               <X className="w-6 h-6" />
             </button>
         </div>
       )}

       {schoolScheduleModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
           <div className="bg-surface rounded-3xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative border border-outline-variant/30 shadow-xl">
             <button
               onClick={() => setSchoolScheduleModalOpen(false)}
               className="absolute top-4 right-4 p-2 text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors"
             >
               <X className="w-6 h-6" />
             </button>
             <h2 className="text-2xl font-display font-bold text-on-surface mb-6">School-wide Schedule</h2>
             
             {schoolScheduleUrl ? (
               <div className="flex flex-col gap-6">
                 <div className="rounded-xl overflow-hidden border border-outline-variant/30 flex items-center justify-center bg-surface-variant/30 relative group">
                    <img src={schoolScheduleUrl} alt="School Schedule" className="w-full h-auto object-contain cursor-pointer" referrerPolicy="no-referrer" onClick={() => window.open(schoolScheduleUrl, '_blank')} />
                    <a href={schoolScheduleUrl} target="_blank" rel="noopener noreferrer" className="absolute bottom-4 right-4 bg-primary text-on-primary px-4 py-2 rounded-full text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 shadow-lg">
                      <Search className="w-4 h-4" /> View Full Size
                    </a>
                 </div>
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center py-12 gap-4">
                 <Calendar className="w-16 h-16 text-on-surface-variant opacity-50" />
                 <p className="text-on-surface-variant font-medium text-lg">No school-wide schedule uploaded yet.</p>
               </div>
             )}
           </div>
         </div>
       )}
    </div>
  );
}

function BuildingIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  );
}
