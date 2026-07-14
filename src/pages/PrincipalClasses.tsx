import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Users, Calendar as CalendarIcon, Clock, BookOpen, MoreHorizontal, Plus, Loader2, ImagePlus, X, Upload, Trash2 } from "lucide-react";
import { cn, formatTeacherName } from "../lib/utils";
import { supabase } from "../lib/supabase";

export default function PrincipalClasses() {
  const [activeProgram, setActiveProgram] = useState("All Programs");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeClassId, setActiveClassId] = useState<string | null>(null);
  const [showAddClass, setShowAddClass] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [programs, setPrograms] = useState<any[]>([]);
  const [classesData, setClassesData] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingClassId, setUploadingClassId] = useState<string | null>(null);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [schoolScheduleUrl, setSchoolScheduleUrl] = useState<string | null>(null);
  const [uploadingSchoolSchedule, setUploadingSchoolSchedule] = useState(false);
  const [schoolScheduleModalOpen, setSchoolScheduleModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const handleTeacherChange = async (classId: string, teacherId: string) => {
    // @ts-ignore
    const { error } = await supabase.from('classes').update({ primary_teacher_id: teacherId }).eq('class_id', classId);
    if (error) {
      alert("Error updating teacher: " + error.message);
      return;
    }
    
    const updatedTeacher = teachers.find(t => t.user_id === teacherId);
    setClassesData(classesData.map(c => 
      c.class_id === classId 
        ? { ...c, primary_teacher_id: teacherId, users: updatedTeacher }
        : c
    ));
  };

  const handleCoTeacherChange = async (classId: string, teacherIds: string[]) => {
    // Try to update array first
    const { error } = await supabase.from('classes').update({ co_teachers: teacherIds }).eq('class_id', classId);
    
    if (error) {
      if (error.code === '42703' || error.message.includes('co_teachers')) {
         alert("Multiple co-teachers requires a database update. Please run the SQL found in supabase_schema_updates.sql (ALTER TABLE classes ADD COLUMN co_teachers UUID[] DEFAULT '{}').");
      } else {
         alert("Error updating co-teachers: " + error.message);
      }
      return;
    }
    
    setClassesData(classesData.map(c => 
      c.class_id === classId 
        ? { ...c, co_teachers: teacherIds }
        : c
    ));
  };

  const handleImageUpload = async (classId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingClassId(classId);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${classId}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('class_images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('class_images')
        .getPublicUrl(fileName);

      const publicUrl = publicUrlData.publicUrl;

      // Update classes table
      // @ts-ignore
      const { error: updateError } = await supabase.from('classes').update({ schedule_image_url: publicUrl }).eq('class_id', classId);

      if (updateError) throw updateError;

      // Update local state
      setClassesData(classesData.map(c => 
        c.class_id === classId ? { ...c, schedule_image_url: publicUrl } : c
      ));

    } catch (err: any) {
      alert("Error uploading image. Did you run the SQL to create the bucket and column? Error: " + err.message);
    } finally {
      setUploadingClassId(null);
    }
  };


  const handleSchoolScheduleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSchoolSchedule(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `school-schedule-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('class_images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('class_images')
        .getPublicUrl(fileName);

      const publicUrl = publicUrlData.publicUrl;

      const { data: existingData } = await supabase.from('announcements').select('announcement_id').eq('title', 'SYSTEM_SCHOOL_SCHEDULE_URL').single();

      if (existingData) {
         const { error: updateError } = await supabase.from('announcements').update({ content: publicUrl }).eq('announcement_id', existingData.announcement_id);
         if (updateError) throw updateError;
      } else {
         const { error: insertError } = await supabase.from('announcements').insert({ title: 'SYSTEM_SCHOOL_SCHEDULE_URL', content: publicUrl, created_by: currentUserId });
         if (insertError) throw insertError;
      }

      setSchoolScheduleUrl(publicUrl);
    } catch (error) {
      console.error("Error uploading schedule:", error);
      alert("Failed to upload schedule.");
    } finally {
      setUploadingSchoolSchedule(false);
    }
  };


  const handleDeleteClassSchedule = async (classId: string) => {
      // confirm removed due to iframe sandbox limits
      try {
          // @ts-ignore
          const { error } = await supabase.from('classes').update({ schedule_image_url: null }).eq('class_id', classId);
          if (error) throw error;
          setClassesData(classesData.map(c => 
             c.class_id === classId ? { ...c, schedule_image_url: null } : c
          ));
      } catch (error: any) {
          alert("Error removing schedule: " + error.message);
      }
  };

  const handleDeleteSchoolSchedule = async () => {
      // confirm removed due to iframe sandbox limits
      try {
          const { error } = await supabase.from('announcements').delete().eq('title', 'SYSTEM_SCHOOL_SCHEDULE_URL');
          if (error) throw error;
          setSchoolScheduleUrl(null);
      } catch (error: any) {
          alert("Error removing school schedule: " + error.message);
      }
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    setIsSubmitting(true);
    
    // @ts-ignore
    const { data, error } = await supabase.from('classes').insert([{ class_name: newClassName.trim() }]).select('*').single();
    if (error) {
       alert("Error adding class: " + error.message);
       setIsSubmitting(false);
       return;
    }
    
    if (data) {
       setClassesData([...classesData, data]);
       setActiveClassId(data.class_id);
       setShowAddClass(false);
       setNewClassName("");
    }
    setIsSubmitting(false);
  };

  useEffect(() => {
    async function fetchData() {
       setLoading(true);
       
       const userStr = localStorage.getItem("user");
       if (userStr) {
         const u = JSON.parse(userStr);
         if (u && u.id) {
           setCurrentUserId(u.id);
         }
       }

       const { data: settingsData } = await supabase.from("announcements").select("*").eq("title", "SYSTEM_SCHOOL_SCHEDULE_URL").single();
       if (settingsData && settingsData.content) {
          setSchoolScheduleUrl(settingsData.content);
       }

       // Fetch programs
       const { data: progData } = await supabase.from('programs').select('*').order('program_name', { ascending: true });
       if (progData) {
         setPrograms(progData);
       }

       // Fetch teachers
       const { data: rData } = await supabase.from('roles').select('role_id').in('role_name', ['Teacher', 'Volunteer', 'Staff', 'Admin', 'Principal', 'Builder']);
       const teacherRoleIds = rData ? (rData as any[]).map(r => r.role_id) : [];
       
       if (teacherRoleIds.length > 0) {
         const { data: urData } = await supabase.from('user_roles').select('user_id').in('role_id', teacherRoleIds);
         if (urData && urData.length > 0) {
            const userIds = (urData as any[]).map(ur => ur.user_id);
            const { data: tData } = await supabase.from('users').select('user_id, first_name, last_name, user_roles(roles(role_name))').in('user_id', userIds);
            if (tData) {
               const filteredUsers = tData.filter((t: any) => !(t.first_name === "Youlin" && t.last_name === "Venerable")).map((t: any) => ({
                 ...t,
                 isVolunteer: t.user_roles?.some((ur: any) => ur.roles?.role_name === 'Volunteer')
               }));
               const sortedUsers = filteredUsers.sort((a, b) => {
                  const nameA = formatTeacherName(a.first_name, a.last_name);
                  const nameB = formatTeacherName(b.first_name, b.last_name);
                  const isMaleA = nameA.startsWith('Mr.');
                  const isMaleB = nameB.startsWith('Mr.');
                  
                  if (isMaleA && !isMaleB) return -1;
                  if (!isMaleA && isMaleB) return 1;
                  
                  const firstNameA = (a.first_name || '').trim();
                  const firstNameB = (b.first_name || '').trim();
                  
                  return firstNameA.localeCompare(firstNameB);
               });
               setTeachers(sortedUsers);
            }
         }
       }

       // Fetch classes with teacher name and enrollments
       const { data: clsData } = await supabase.from('classes').select(`
          *,
          users:primary_teacher_id (first_name, last_name),
          co_teacher:co_teacher_id (first_name, last_name),
          co_teachers,
          enrollments (program_id)
       `);
       
       if (clsData) {
         setClassesData(clsData);
       }
       
       setLoading(false);
    }
    fetchData();
  }, []);

  const allPrograms = ["All Programs", ...programs.map((p: any) => p.program_name)];

  const filteredClasses = classesData.filter(c => {
    const matchesSearch = c.class_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (c.users?.first_name + ' ' + c.users?.last_name).toLowerCase().includes(searchQuery.toLowerCase());
                          
    let matchesProgram = true;
    if (activeProgram !== "All Programs") {
       const activeProgObj = programs.find(p => p.program_name === activeProgram);
       if (activeProgObj) {
           matchesProgram = c.enrollments?.some((e: any) => e.program_id === activeProgObj.program_id);
       }
    }

    return matchesSearch && matchesProgram;
  });

  const activeClass = activeClassId 
     ? filteredClasses.find(c => c.class_id === activeClassId) || filteredClasses[0] 
     : filteredClasses[0];

  return (
    <div className="w-full max-w-[1600px] mx-auto p-6 md:p-8 flex flex-col gap-8 pb-32 md:pb-8">
       {/* Header */}
       <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div>
           <h1 className="font-display text-4xl text-primary font-bold tracking-tight">Class Management</h1>
           <p className="font-body text-lg text-on-surface-variant mt-2">Manage programs, classes, and assign teachers.</p>
         </div>
         <div className="flex gap-4 w-full md:w-auto">
         <button onClick={() => setSchoolScheduleModalOpen(true)} className="flex items-center gap-2 bg-secondary text-on-secondary px-6 py-3 rounded-full font-label font-bold hover:bg-secondary/90 transition-colors shadow-md flex-1 md:flex-none justify-center">
            <CalendarIcon className="w-5 h-5" /> School Schedule
         </button>
         <button onClick={() => setShowAddClass(true)} className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-label font-bold hover:bg-primary/90 transition-colors shadow-md flex-1 md:flex-none justify-center">
            <Plus className="w-5 h-5" /> Add New Class
         </button>
         </div>
       </header>

       {/* Toolbar */}
       <div className="flex flex-col xl:flex-row justify-between gap-6">
          {/* Filters */}
          <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar w-full xl:w-auto">
             {allPrograms.map(prog => (
                <button
                  key={prog}
                  onClick={() => setActiveProgram(prog)}
                  className={cn(
                    "whitespace-nowrap px-6 py-2.5 rounded-full font-label text-sm transition-all border font-bold shrink-0",
                    activeProgram === prog 
                      ? "bg-primary-container text-on-primary-container border-primary-container shadow-sm" 
                      : "bg-surface text-on-surface-variant border-outline-variant/40 hover:bg-surface-variant/50"
                  )}
                >
                   {prog}
                </button>
             ))}
          </div>

          {/* Search */}
          <div className="flex items-center gap-3 bg-surface-container-low rounded-full px-4 py-2 border border-outline-variant/40 shrink-0 w-full xl:w-80 shadow-sm focus-within:border-primary/50 transition-colors">
             <Search className="w-5 h-5 text-on-surface-variant" />
             <input 
               type="text" 
               placeholder="Search by class or teacher..." 
               className="bg-transparent border-none outline-none font-body text-sm w-full"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
             <button className="p-1.5 text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors">
               <Filter className="w-4 h-4" />
             </button>
          </div>
       </div>

       {/* Classes Tabs */}
       {!loading && filteredClasses.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-4">
             {filteredClasses.map(cls => {
                const isActive = activeClassId ? activeClassId === cls.class_id : filteredClasses[0]?.class_id === cls.class_id;
                return (
                   <button
                      key={cls.class_id}
                      onClick={() => setActiveClassId(cls.class_id)}
                      className={cn(
                        "px-5 py-2.5 rounded-xl font-label text-sm font-bold transition-all border",
                        isActive
                          ? "bg-secondary text-on-secondary border-secondary shadow-md"
                          : "bg-surface text-on-surface-variant border-outline-variant/40 hover:bg-surface-variant hover:text-on-surface"
                      )}
                   >
                      {cls.class_name}
                   </button>
                );
             })}
          </div>
       )}

       {/* Active Class Info */}
       {loading ? (
         <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
         </div>
       ) : filteredClasses.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-surface border border-dashed border-outline-variant/40 rounded-3xl text-center">
             <BookOpen className="w-12 h-12 text-on-surface-variant opacity-50 mb-4" />
             <h3 className="font-title text-xl text-on-surface font-bold">No classes found</h3>
             <p className="font-body text-on-surface-variant mt-2">Try adjusting your filters or search query.</p>
          </div>
       ) : (
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 overflow-hidden shadow-sm flex flex-col md:flex-row min-h-[500px]">
             {/* Class Details */}
             <div className="w-full md:w-1/4 p-6 md:p-8 flex flex-col gap-6 border-b md:border-b-0 md:border-r border-outline-variant/20">
                <div className="flex justify-between items-start">
                   <div>
                      <span className="px-3 py-1 text-xs font-bold font-label rounded-full border bg-surface-variant text-on-surface border-outline-variant/30 w-fit mb-3 inline-block">
                         Class Information
                      </span>
                      <h3 className="font-display text-3xl font-bold text-on-surface leading-tight">{activeClass?.class_name}</h3>
                   </div>
                   <div className="flex items-center gap-2">
                       <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id={`upload-${activeClass?.class_id}`}
                          onChange={(e) => activeClass && handleImageUpload(activeClass.class_id, e)}
                       />
                       <label 
                          htmlFor={`upload-${activeClass?.class_id}`} 
                          className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-full bg-surface-variant text-on-surface-variant hover:bg-primary hover:text-on-primary transition-colors cursor-pointer border border-outline-variant/30"
                       >
                          {uploadingClassId === activeClass?.class_id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <ImagePlus className="w-4 h-4" />
                          )}
                          <span>Upload Schedule</span>
                       </label>
                   </div>
                </div>

                <div className="flex items-center justify-between bg-surface-variant/30 px-4 py-3 rounded-2xl border border-outline-variant/30 mt-4">
                   <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-on-surface-variant" />
                      <span className="font-label text-sm font-bold text-on-surface-variant uppercase tracking-wider">Students Enrolled</span>
                   </div>
                   <span className="font-display text-2xl font-bold text-on-surface">
                      {activeClass?.enrollments?.length ?? 0}
                   </span>
                </div>

                <div className="mt-auto pt-6">
                   <h4 className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4">Homeroom Teacher</h4>
                   <div className="flex items-center gap-4 bg-surface px-4 py-3 rounded-2xl border border-outline-variant/30">
                      <div className="w-12 h-12 rounded-full border-2 border-surface shadow-sm bg-surface-variant flex items-center justify-center font-bold text-lg text-on-surface-variant overflow-hidden shrink-0">
                         {activeClass?.users ? activeClass.users.first_name?.[0] : '?'}
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                         <select 
                            value={activeClass?.primary_teacher_id || ""}
                            onChange={(e) => activeClass && handleTeacherChange(activeClass.class_id, e.target.value)}
                            className="font-title text-base font-bold text-on-surface bg-transparent border-none outline-none cursor-pointer focus:ring-1 focus:ring-primary rounded px-1 -ml-1 w-full truncate"
                         >
                            <option value="">Select Homeroom Teacher</option>
                            {teachers.map(t => (
                               <option key={t.user_id} value={t.user_id}>{t.isVolunteer ? `${t.first_name || ''} ${t.last_name || ''}`.trim() || 'Volunteer' : formatTeacherName(t.first_name, t.last_name)}</option>
                            ))}
                         </select>
                      </div>
                   </div>

                   <h4 className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4 mt-6">Co-Teachers (Volunteers / Staff)</h4>
                   <div className="flex flex-col gap-2">
                      {(activeClass?.co_teachers || activeClass?.co_teacher_id ? (activeClass.co_teachers || [activeClass.co_teacher_id].filter(Boolean)) : []).map((ct_id: string) => {
                         const ct = teachers.find(t => t.user_id === ct_id);
                         return (
                           <div key={ct_id} className="flex items-center gap-4 bg-surface px-4 py-3 rounded-2xl border border-outline-variant/30">
                              <div className="w-10 h-10 rounded-full border-2 border-surface shadow-sm bg-surface-variant flex items-center justify-center font-bold text-sm text-on-surface-variant overflow-hidden shrink-0">
                                 {ct ? ct.first_name?.[0] : '?'}
                              </div>
                              <div className="flex flex-col flex-1 min-w-0">
                                 <div className="font-title text-sm font-bold text-on-surface truncate">
                                    {ct ? (ct.isVolunteer ? `${ct.first_name || ''} ${ct.last_name || ''}`.trim() || 'Volunteer' : formatTeacherName(ct.first_name, ct.last_name)) : 'Unknown'}
                                 </div>
                              </div>
                              <button
                                 onClick={() => {
                                    if (!activeClass) return;
                                    const currentArr = activeClass.co_teachers || (activeClass.co_teacher_id ? [activeClass.co_teacher_id] : []);
                                    const newArr = currentArr.filter((id: string) => id !== ct_id);
                                    handleCoTeacherChange(activeClass.class_id, newArr);
                                 }}
                                 className="w-8 h-8 rounded-full bg-error-container text-on-error-container hover:bg-error-container/80 flex items-center justify-center transition-colors shrink-0"
                              >
                                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                              </button>
                           </div>
                         );
                      })}
                      
                      <div className="flex items-center gap-4 bg-surface px-4 py-3 rounded-2xl border border-outline-variant/30 border-dashed mt-2">
                         <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                         </div>
                         <div className="flex flex-col flex-1 min-w-0">
                            <select 
                               value=""
                               onChange={(e) => {
                                  if (!activeClass || !e.target.value) return;
                                  const currentArr = activeClass.co_teachers || (activeClass.co_teacher_id ? [activeClass.co_teacher_id] : []);
                                  const newArr = [...currentArr, e.target.value];
                                  handleCoTeacherChange(activeClass.class_id, newArr);
                               }}
                               className="font-title text-sm font-bold text-on-surface-variant bg-transparent border-none outline-none cursor-pointer focus:ring-1 focus:ring-primary rounded px-1 -ml-1 w-full truncate"
                            >
                               <option value="">Add Co-Teacher...</option>
                               {teachers.filter(t => {
                                  const currentArr = activeClass?.co_teachers || (activeClass?.co_teacher_id ? [activeClass.co_teacher_id] : []);
                                  return !currentArr.includes(t.user_id);
                               }).map(t => (
                                  <option key={t.user_id} value={t.user_id}>{t.isVolunteer ? `${t.first_name || ''} ${t.last_name || ''}`.trim() || 'Volunteer' : formatTeacherName(t.first_name, t.last_name)}</option>
                               ))}
                            </select>
                         </div>
                      </div>
                   </div>
                   
                   <p className="font-body text-xs text-on-surface-variant mt-4 px-1">
                     Need to assign multiple teachers or volunteers? Use the <Link to="/admin/management" className="text-primary font-bold hover:underline">Enrollments Tool</Link> in System Setup.
                   </p>
                </div>
             </div>

             {/* Right side: Schedule Image */}
             <div className="w-full md:w-3/4 bg-surface-variant/20 p-6 md:p-8 flex items-center justify-center min-h-[400px]">
                {activeClass?.schedule_image_url ? (
                   <div className="relative group w-full flex justify-center">
                       <img 
                          src={activeClass.schedule_image_url} 
                          alt="Class Schedule" 
                          className="max-w-full max-h-[600px] object-contain rounded-2xl shadow-sm border border-outline-variant/20 cursor-pointer hover:scale-[1.01] transition-transform" 
                          onClick={() => setEnlargedImage(activeClass.schedule_image_url)}
                          referrerPolicy="no-referrer"
                       />
                       <button onClick={() => handleDeleteClassSchedule(activeClass.class_id)} className="absolute top-4 right-4 bg-error text-on-error p-2 pr-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-error/90 flex items-center gap-2 font-label font-bold text-sm">
                           <Trash2 className="w-4 h-4" />
                           Delete
                       </button>
                   </div>
                ) : (
                   <div className="flex flex-col items-center justify-center text-on-surface-variant max-w-sm text-center">
                      <CalendarIcon className="w-16 h-16 mb-4 opacity-50" />
                      <h4 className="font-title text-xl font-bold text-on-surface">No Schedule Image</h4>
                      <p className="font-body text-sm mt-2 mb-6 opacity-80">Upload a schedule image to display it here for this class.</p>
                      
                      <label 
                          htmlFor={`upload-${activeClass?.class_id}`} 
                          className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-label font-bold hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
                      >
                         {uploadingClassId === activeClass?.class_id ? (
                           <Loader2 className="w-5 h-5 animate-spin" />
                         ) : (
                           <ImagePlus className="w-5 h-5" />
                         )}
                         Upload Image
                      </label>
                   </div>
                )}
             </div>
          </div>
       )}

       
       {schoolScheduleModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
           <div className="bg-surface-container-lowest rounded-3xl w-full max-w-4xl p-6 md:p-8 shadow-xl relative max-h-[90vh] overflow-y-auto">
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
                 <div className="flex justify-center gap-4">
                    <label className="cursor-pointer px-6 py-2 rounded-full font-label font-bold text-sm bg-primary-container text-on-primary-container hover:bg-primary-container/80 transition-colors flex items-center gap-2">
                       <Upload className="w-4 h-4" />
                       {uploadingSchoolSchedule ? "Uploading..." : "Update Schedule"}
                       <input type="file" accept="image/*" className="hidden" onChange={handleSchoolScheduleUpload} disabled={uploadingSchoolSchedule} />
                    </label>
                    <button className="px-6 py-2 rounded-full font-label font-bold text-sm bg-error/10 text-error hover:bg-error/20 transition-colors flex items-center gap-2" onClick={handleDeleteSchoolSchedule}>
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
                 </div>
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center py-12 gap-4">
                 <CalendarIcon className="w-16 h-16 text-on-surface-variant opacity-50" />
                 <p className="text-on-surface-variant font-medium text-lg">No school-wide schedule uploaded yet.</p>
                 <label className="cursor-pointer px-6 py-2 rounded-full font-label font-bold text-sm bg-primary text-on-primary hover:bg-primary/90 transition-colors flex items-center gap-2 mt-4">
                    <Upload className="w-4 h-4" />
                    {uploadingSchoolSchedule ? "Uploading..." : "Upload Schedule"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleSchoolScheduleUpload} disabled={uploadingSchoolSchedule} />
                 </label>
               </div>
             )}
           </div>
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

       {showAddClass && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
             <div className="bg-surface rounded-3xl p-6 md:p-8 w-full max-w-md shadow-xl flex flex-col relative border border-outline-variant/30">
                 <button onClick={() => setShowAddClass(false)} className="absolute top-4 right-4 p-2 bg-surface-variant/50 text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors">
                     <X className="w-5 h-5" />
                 </button>
                 <h2 className="font-display text-2xl font-bold text-on-surface mb-2">Add New Class</h2>
                 <p className="font-body text-sm text-on-surface-variant mb-6">Create a new class for a program.</p>
                 
                 <form onSubmit={handleAddClass} className="flex flex-col gap-4">
                     <div className="flex flex-col gap-2">
                         <label className="font-label text-sm font-bold text-on-surface-variant">Class Name</label>
                         <input
                           type="text"
                           value={newClassName}
                           onChange={(e) => setNewClassName(e.target.value)}
                           className="bg-surface-container-low px-4 py-3 border border-outline-variant/50 rounded-xl font-body focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full"
                           placeholder="e.g. 1st Grade Math"
                           autoFocus
                           required
                         />
                     </div>
                     <div className="flex justify-end gap-3 mt-4">
                         <button type="button" onClick={() => setShowAddClass(false)} className="px-6 py-2.5 font-label font-bold text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors">
                            Cancel
                         </button>
                         <button type="submit" disabled={isSubmitting || !newClassName.trim()} className="px-6 py-2.5 bg-primary text-on-primary font-label font-bold rounded-full hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50">
                            {isSubmitting ? 'Adding...' : 'Add Class'}
                         </button>
                     </div>
                 </form>
             </div>
         </div>
       )}
    </div>
  );
}
