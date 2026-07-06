import React, { useState, useEffect } from "react";
import { Search, Filter, Users, Calendar as CalendarIcon, Clock, BookOpen, MoreHorizontal, Plus, Loader2, ImagePlus, X } from "lucide-react";
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

  const handleTeacherChange = async (classId: string, teacherId: string) => {
    const newTeacherId = teacherId === "unassigned" ? null : teacherId;
    
    // @ts-ignore
    const { error } = await supabase.from('classes').update({ primary_teacher_id: newTeacherId }).eq('class_id', classId);
    if (error) {
      alert("Error updating teacher: " + error.message);
      return;
    }
    
    const updatedTeacher = teachers.find(t => t.user_id === newTeacherId);
    setClassesData(classesData.map(c => 
      c.class_id === classId 
        ? { ...c, primary_teacher_id: newTeacherId, users: updatedTeacher }
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
       
       // Fetch programs
       const { data: progData } = await supabase.from('programs').select('*').order('program_name', { ascending: true });
       if (progData) {
         setPrograms(progData);
       }

       // Fetch teachers
       const { data: rData } = await supabase.from('roles').select('role_id').ilike('role_name', '%teacher%');
       const teacherRoleIds = rData ? (rData as any[]).map(r => r.role_id) : [];
       
       if (teacherRoleIds.length > 0) {
         const { data: urData } = await supabase.from('user_roles').select('user_id').in('role_id', teacherRoleIds);
         if (urData && urData.length > 0) {
            const userIds = (urData as any[]).map(ur => ur.user_id);
            const { data: tData } = await supabase.from('users').select('user_id, first_name, last_name').in('user_id', userIds);
            if (tData) {
              setTeachers(tData.filter((t: any) => !(t.first_name === "Youlin" && t.last_name === "Venerable")));
            }
         }
       }

       // Fetch classes with teacher name and enrollments
       const { data: clsData } = await supabase.from('classes').select(`
          *,
          users:primary_teacher_id (first_name, last_name),
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
         <button onClick={() => setShowAddClass(true)} className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-label font-bold hover:bg-primary/90 transition-colors shadow-md w-full md:w-auto justify-center">
            <Plus className="w-5 h-5" /> Add New Class
         </button>
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
                            value={activeClass?.primary_teacher_id || "unassigned"}
                            onChange={(e) => activeClass && handleTeacherChange(activeClass.class_id, e.target.value)}
                            className="font-title text-base font-bold text-on-surface bg-transparent border-none outline-none cursor-pointer focus:ring-1 focus:ring-primary rounded px-1 -ml-1 w-full truncate"
                         >
                            <option value="unassigned">Unassigned</option>
                            {teachers.map(t => (
                               <option key={t.user_id} value={t.user_id}>{formatTeacherName(t.first_name, t.last_name)}</option>
                            ))}
                         </select>
                      </div>
                   </div>
                </div>
             </div>

             {/* Right side: Schedule Image */}
             <div className="w-full md:w-3/4 bg-surface-variant/20 p-6 md:p-8 flex items-center justify-center min-h-[400px]">
                {activeClass?.schedule_image_url ? (
                   <img 
                      src={activeClass.schedule_image_url} 
                      alt="Class Schedule" 
                      className="max-w-full max-h-[600px] w-full object-contain rounded-2xl shadow-sm border border-outline-variant/20 cursor-pointer hover:scale-[1.01] transition-transform" 
                      onClick={() => setEnlargedImage(activeClass.schedule_image_url)}
                      referrerPolicy="no-referrer"
                   />
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
