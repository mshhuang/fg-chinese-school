import { useState, useEffect } from "react";
import { ExternalLink, Save, FileText, LayoutDashboard, UserSquare2, RefreshCw, Info, Sparkles } from "lucide-react";
import { supabase } from "../lib/supabase";
import { formatTeacherName } from "../lib/utils";

export default function MyLessonPlans() {
  const [user, setUser] = useState<any>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  
  const [savedUrl, setSavedUrl] = useState("");
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [tempUrl, setTempUrl] = useState("");
  const [lessonPlanId, setLessonPlanId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [adminComments, setAdminComments] = useState("");
  const [isSavingComment, setIsSavingComment] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);

  useEffect(() => {
     const userStr = localStorage.getItem('user');
     if (userStr) {
        const u = JSON.parse(userStr);
        setUser(u);
        const role = u.role?.toLowerCase() || '';
        if (role === 'principal' || role === 'admin' || role === 'builder') {
           fetchTeachers();
        } else {
           setSelectedTeacherId(u.id);
        }
     }
  }, []);

  useEffect(() => {
     if (selectedTeacherId) {
        fetchLessonPlan(selectedTeacherId);
     } else {
        setSavedUrl("");
        setTempUrl("");
        setLessonPlanId(null);
     }
  }, [selectedTeacherId]);

  const fetchTeachers = async () => {
     try {
       const { data: rolesData } = await supabase.from('roles').select('*');
       if (rolesData) {
          const teacherRole = rolesData.find(r => r.role_name.toLowerCase() === 'teacher');
          if (teacherRole) {
             const { data: userRoles } = await supabase.from('user_roles').select('user_id').eq('role_id', teacherRole.role_id);
             if (userRoles && userRoles.length > 0) {
                const teacherIds = userRoles.map(ur => ur.user_id);
                const { data: usersData } = await supabase.from('users').select('user_id, first_name, last_name').in('user_id', teacherIds).order('first_name');
                if (usersData) {
                   const filteredUsers = usersData.filter(u => !(u.first_name === 'Youlin' && u.last_name === 'Venerable'));
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
       }
     } catch (err) {
       console.error("Error fetching teachers:", err);
     }
  };

  const fetchLessonPlan = async (teacherId: string) => {
     setLoading(true);
     try {
       const { data, error } = await supabase
         .from('lesson_plans')
         .select('*')
         .eq('teacher_id', teacherId)
         .eq('title', 'Google Doc Link')
         .limit(1).maybeSingle();

       if (data) {
          setIframeLoading(true);
          setSavedUrl(data.content_rich_text || "");
          setTempUrl(data.content_rich_text || "");
          let parsedComments = data.file_url || "";
          try {
             const j = JSON.parse(parsedComments);
             if (Array.isArray(j)) {
                parsedComments = j.map(c => c.text || "").join("\n\n");
             }
          } catch(e) {}
          setAdminComments(parsedComments);
          setLessonPlanId(data.lesson_plan_id);
       } else {
          setSavedUrl("");
          setTempUrl("");
          setAdminComments("");
          setLessonPlanId(null);
       }
     } catch (err) {
       console.error("Error fetching lesson plan:", err);
     } finally {
       setLoading(false);
     }
  };

  const handleSave = async () => {
     if (!selectedTeacherId) return;

     setLoading(true);
     try {
       if (lessonPlanId) {
          const { error } = await supabase
            .from('lesson_plans')
            .update({ content_rich_text: tempUrl })
            .eq('lesson_plan_id', lessonPlanId);
          if (error) {
             console.error(error);
             alert("Error updating lesson plan: " + error.message);
          }
       } else {
          const { data, error } = await supabase
            .from('lesson_plans')
            .insert({
               title: 'Google Doc Link',
               week_number: 1,
               content_rich_text: tempUrl,
               teacher_id: selectedTeacherId
            })
            .select()
            .single();
          if (error) {
             console.error(error);
             alert("Error saving lesson plan: " + error.message);
          }
          if (data) setLessonPlanId(data.lesson_plan_id);
       }

       setIframeLoading(true);
       setSavedUrl(tempUrl);
       setIsEditingUrl(false);
     } catch (err) {
       console.error("Error saving lesson plan:", err);
     } finally {
       setLoading(false);
     }
  };

  const isAdmin = user && (user.role === 'principal' || user.role === 'admin' || user.role === 'builder');

  const getPreviewUrl = (url: string) => {
     if (!url) return "";
     try {
         let processedUrl = url.trim();
         if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
             processedUrl = 'https://' + processedUrl;
         }
         if (processedUrl.includes('docs.google.com')) {
             if (processedUrl.includes('/presentation/')) {
                 return processedUrl.replace(/\/(edit|view).*$/, '/embed');
             }
             return processedUrl.replace(/\/(edit|view).*$/, '/preview');
         }
         return processedUrl;
     } catch(e) {}
     return url;
  };

  const handleSaveComment = async () => {
     if (!lessonPlanId) return;
     setIsSavingComment(true);
     try {
        const { error } = await supabase
          .from('lesson_plans')
          .update({ file_url: adminComments })
          .eq('lesson_plan_id', lessonPlanId);
        if (error) {
           console.error(error);
           alert("Error saving comments: " + error.message);
        } else {
           alert("Comments saved successfully.");
        }
     } catch (err) {
        console.error(err);
     } finally {
        setIsSavingComment(false);
     }
  };


  return (
    <div className="w-full max-w-[1600px] mx-auto p-6 md:p-8 flex flex-col gap-8 min-h-screen pb-32 md:pb-8">
       {/* Header */}
       <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
         <div>
           <h1 className="font-display text-4xl text-primary font-bold tracking-tight">{isAdmin ? 'Teacher Lesson Plans' : 'My Lesson Plans'}</h1>
           <p className="font-body text-lg text-on-surface-variant mt-2">
             {isAdmin ? 'View lesson plans submitted by teachers.' : 'Manage and collaborate on your curriculum via Google Docs or Slides.'}
           </p>
         </div>
       </header>
       
       {isAdmin && (
          <div className="bg-surface-container rounded-2xl border border-outline-variant/30 p-5 shrink-0 flex items-center gap-4 shadow-sm">
             <div className="font-label font-bold text-primary flex items-center gap-2">
                <UserSquare2 className="w-5 h-5" /> Select Teacher
             </div>
             <select 
                value={selectedTeacherId} 
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="flex-1 max-w-sm px-4 py-2.5 rounded-xl border border-outline-variant/50 popup focus:border-primary outline-none font-body bg-surface text-on-surface"
             >
                <option value="">-- Choose a Teacher --</option>
                {teachers.map(t => (
                   <option key={t.user_id} value={t.user_id}>{formatTeacherName(t.first_name, t.last_name)}</option>
                ))}
             </select>
          </div>
       )}

       {/* Link Manager */}
       {selectedTeacherId ? (
         <>
           <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-6 flex flex-col gap-4 shrink-0 shadow-sm">
             <div className="font-title text-lg text-on-surface font-bold flex items-center gap-2 relative">
               <FileText className="w-5 h-5 text-primary" /> Google Doc or Slide Link
               {!isAdmin && (
                 <div className="relative group flex items-center">
                   <div className="flex items-center gap-1.5 bg-blue-100 text-blue-700 px-3 py-1 rounded-full cursor-help hover:bg-blue-200 transition-colors border border-blue-200 ml-2">
                     <Info className="w-4 h-4 animate-pulse" />
                     <span className="text-xs font-bold font-label uppercase tracking-wider">Help</span>
                   </div>
                   <div className="absolute right-0 top-full mt-3 hidden group-hover:block w-80 bg-surface-container-highest text-on-surface text-sm p-5 rounded-2xl shadow-xl border border-outline-variant/50 z-[100] pointer-events-none transform transition-all duration-200 origin-top-right">
                      <div className="absolute -top-2 right-6 w-4 h-4 bg-surface-container-highest border-t border-l border-outline-variant/50 rotate-45"></div>
                      <p className="font-bold font-display text-primary mb-3 text-base flex items-center gap-2"><Sparkles className="w-4 h-4" /> Sharing Instructions</p>
                      <ol className="list-decimal pl-5 space-y-2 font-body text-on-surface-variant">
                        <li>Open your Google Doc or Slide.</li>
                        <li>Click the blue <strong>Share</strong> button in the top right.</li>
                        <li>Under "General access", change Restricted to <strong>Anyone with the link</strong>.</li>
                        <li>Ensure the role on the right is set to <strong>Viewer</strong>.</li>
                        <li>Click <strong>Copy link</strong> and paste it into the field below.</li>
                      </ol>
                   </div>
                 </div>
               )}
             </div>
             <p className="font-body text-sm text-on-surface-variant">
               {isAdmin ? 'View the Google Doc/Slide link provided by the selected teacher.' : 'Share a Google Doc or Slide link for administrators to view your curriculum.'}
             </p>

             <div className="flex items-center gap-4 mt-2">
               {isEditingUrl && !isAdmin ? (
                 <div className="flex-1 flex gap-2">
                   <input 
                     type="text" 
                     value={tempUrl} 
                     onChange={(e) => setTempUrl(e.target.value)} 
                     className="flex-1 bg-surface border border-outline-variant/50 rounded-xl px-4 py-2 font-body text-on-surface outline-none focus:border-primary shadow-sm"
                     placeholder="Paste Google Doc or Slide sharing link here..."
                     autoFocus
                   />
                   <button onClick={handleSave} disabled={loading} className="bg-primary text-on-primary px-6 py-2 rounded-xl font-label font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50">
                     <Save className="w-4 h-4" /> Save
                   </button>
                 </div>
               ) : (
                 <div className="flex-1 flex flex-col md:flex-row items-start md:items-center justify-between bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 gap-4">
                   <div className="flex items-center gap-3 min-w-0 flex-1">
                     <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                       <FileText className="w-4 h-4 text-blue-600" />
                     </div>
                     <span className="font-body text-on-surface truncate text-sm md:text-base">{savedUrl ? "Google File" : "No file linked yet."}</span>
                   </div>
                   <div className="flex gap-2 shrink-0">
                     {!isAdmin && (
                        <button onClick={() => setIsEditingUrl(true)} className="px-4 py-2 rounded-lg border border-outline-variant hover:bg-surface-variant font-label text-sm font-bold transition-colors">
                          Edit
                        </button>
                     )}
                     {savedUrl && (
                        <a href={isAdmin ? getPreviewUrl(savedUrl) : savedUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-blue-600 focus:ring-4 focus:ring-blue-300 text-white px-4 py-2 rounded-lg font-label text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
                          <ExternalLink className="w-4 h-4" /> Open File
                        </a>
                     )}
                   </div>
                 </div>
               )}
             </div>
           </div>

           {/* Iframe View (Attempt) */}
           {savedUrl && (
              <div className="flex-1 bg-surface-container-low rounded-3xl overflow-hidden border border-outline-variant/30 shadow-inner relative flex flex-col min-h-[800px]">
                 <div className="p-4 bg-surface-container-lowest border-b border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
                   <div className="flex items-center gap-2">
                     <span className="font-label text-sm text-on-surface font-bold flex items-center gap-2">
                       <LayoutDashboard className="w-4 h-4" /> Document/Slide Preview
                     </span>
                     {isAdmin && (
                       <button 
                          onClick={() => { setIframeLoading(true); setRefreshKey(prev => prev + 1); }}
                          className="flex items-center gap-1 px-2 py-1 bg-surface-variant hover:bg-outline-variant/30 text-on-surface-variant rounded-md text-xs font-medium transition-colors"
                          title="Refresh Preview"
                       >
                         <RefreshCw className="w-3 h-3" /> Refresh
                       </button>
                     )}
                   </div>
                   <span className="font-caption text-xs text-on-surface-variant">
                     Wait for content to be loaded...
                   </span>
                 </div>

                 {iframeLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface/80 backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-3">
                           <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYzRzajhqcHVlZnFyaDBkNXQwaW1tcHVqcTh3bjhpZWZlNjBocGNhbyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/11Qx1E3Pnvt2Bq/giphy.gif" alt="Hourglass Loading" className="w-16 h-16 rounded-full object-cover shadow-sm mix-blend-multiply" />
                           <span className="font-label font-bold text-primary animate-pulse">Loading Document...</span>
                        </div>
                    </div>
                 )}
                 <iframe 
                    key={refreshKey}
                    src={isAdmin ? getPreviewUrl(savedUrl) : getPreviewUrl(savedUrl)} 
                    title="Lesson Plans Document"
                    className="w-full flex-1 border-none bg-surface z-0 relative"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    onLoad={() => setIframeLoading(false)}
                 />
                 
                 {/* Overlay to inform users if doc isn't showing */}
                 <div className="absolute inset-x-0 bottom-0 top-[60px] pointer-events-none flex items-center justify-center z-[-2] bg-surface-container-lowest">
                   <div className="text-center p-8 max-w-md">
                     <FileText className="w-16 h-16 opacity-10 mx-auto mb-4" />
                     <h3 className="font-title text-xl text-on-surface font-bold mb-2">Google File Viewer</h3>
                     <p className="font-body text-on-surface-variant">
                       Wait for content to be loaded... If it doesn't appear, please use the Open File button above.
                     </p>
                   </div>
                 </div>
              </div>
           )}

           {/* Admin Comments */}
           {savedUrl && (
             <div className="bg-surface-container rounded-3xl border border-outline-variant/30 p-6 flex flex-col gap-4 shrink-0 shadow-sm mt-4">
               <div className="font-title text-lg text-on-surface font-bold">
                 {isAdmin ? "Leave a Comment for Teacher" : "Admin Comments"}
               </div>
               <textarea 
                 value={adminComments}
                 onChange={(e) => setAdminComments(e.target.value)}
                 readOnly={!isAdmin}
                 placeholder={isAdmin ? "Enter feedback or comments here..." : "No comments from admin yet."}
                 className="w-full h-32 p-4 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface resize-none"
               />
               {isAdmin && (
                 <div className="flex justify-end">
                   <button 
                     onClick={handleSaveComment} 
                     disabled={isSavingComment || !lessonPlanId} 
                     className="bg-primary text-on-primary px-6 py-2 rounded-xl font-label font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                   >
                     {isSavingComment ? "Saving..." : "Save Comments"}
                   </button>
                 </div>
               )}
             </div>
           )}
         </>
       ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-surface-container-low rounded-3xl border border-outline-variant/30 min-h-[400px]">
             <FileText className="w-12 h-12 text-on-surface-variant/30 mb-4" />
             <h3 className="text-xl font-title font-bold text-on-surface">No Teacher Selected</h3>
             <p className="text-on-surface-variant font-body">Select a teacher from the dropdown above to view their lesson plans.</p>
          </div>
       )}
    </div>
  );
}
