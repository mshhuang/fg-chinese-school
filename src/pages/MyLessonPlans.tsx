import { useState, useEffect } from "react";
import { ExternalLink, Save, FileText, LayoutDashboard, UserSquare2, RefreshCw } from "lucide-react";
import { supabase } from "../lib/supabase";

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
                if (usersData) setTeachers(usersData);
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
          setSavedUrl(data.content_rich_text || "");
          setTempUrl(data.content_rich_text || "");
          setLessonPlanId(data.lesson_plan_id);
       } else {
          setSavedUrl("");
          setTempUrl("");
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
         if (url.includes('docs.google.com') && url.includes('/edit')) {
             return url.replace(/\/edit.*$/, '/preview');
         }
     } catch(e) {}
     return url;
  };


  return (
    <div className="w-full max-w-[1600px] mx-auto p-6 md:p-8 flex flex-col gap-8 min-h-screen pb-32 md:pb-8">
       {/* Header */}
       <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
         <div>
           <h1 className="font-display text-4xl text-primary font-bold tracking-tight">{isAdmin ? 'Teacher Lesson Plans' : 'My Lesson Plans'}</h1>
           <p className="font-body text-lg text-on-surface-variant mt-2">
             {isAdmin ? 'View lesson plans submitted by teachers.' : 'Manage and collaborate on your curriculum via Google Docs.'}
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
                   <option key={t.user_id} value={t.user_id}>{t.first_name} {t.last_name}</option>
                ))}
             </select>
          </div>
       )}

       {/* Link Manager */}
       {selectedTeacherId ? (
         <>
           <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-6 flex flex-col gap-4 shrink-0 shadow-sm">
             <div className="font-title text-lg text-on-surface font-bold flex items-center gap-2">
               <FileText className="w-5 h-5 text-primary" /> Google Document Link
             </div>
             <p className="font-body text-sm text-on-surface-variant">
               {isAdmin ? 'View the Google Doc link provided by the selected teacher.' : 'Share a Google Doc link for administrators to view your curriculum.'}
             </p>

             <div className="flex items-center gap-4 mt-2">
               {isEditingUrl && !isAdmin ? (
                 <div className="flex-1 flex gap-2">
                   <input 
                     type="text" 
                     value={tempUrl} 
                     onChange={(e) => setTempUrl(e.target.value)} 
                     className="flex-1 bg-surface border border-outline-variant/50 rounded-xl px-4 py-2 font-body text-on-surface outline-none focus:border-primary shadow-sm"
                     placeholder="Paste Google Doc sharing link here..."
                     autoFocus
                   />
                   <button onClick={handleSave} disabled={loading} className="bg-primary text-on-primary px-6 py-2 rounded-xl font-label font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50">
                     <Save className="w-4 h-4" /> Save
                   </button>
                 </div>
               ) : (
                 <div className="flex-1 flex flex-col md:flex-row items-start md:items-center justify-between bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 gap-4">
                   <div className="flex items-center gap-3 overflow-hidden w-full">
                     <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                       <FileText className="w-4 h-4 text-blue-600" />
                     </div>
                     <span className="font-body text-on-surface truncate text-sm md:text-base">{savedUrl || "No document linked yet."}</span>
                   </div>
                   <div className="flex gap-2 shrink-0 w-full md:w-auto">
                     {!isAdmin && (
                        <button onClick={() => setIsEditingUrl(true)} className="flex-1 md:flex-none px-4 py-2 rounded-lg border border-outline-variant hover:bg-surface-variant font-label text-sm font-bold transition-colors">
                          Edit Link
                        </button>
                     )}
                     {savedUrl && (
                        <a href={isAdmin ? getPreviewUrl(savedUrl) : savedUrl} target="_blank" rel="noopener noreferrer" className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 focus:ring-4 focus:ring-blue-300 text-white px-4 py-2 rounded-lg font-label text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
                          <ExternalLink className="w-4 h-4" /> Open Document
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
                       <LayoutDashboard className="w-4 h-4" /> Document Preview
                     </span>
                     {isAdmin && (
                       <button 
                          onClick={() => setRefreshKey(prev => prev + 1)}
                          className="flex items-center gap-1 px-2 py-1 bg-surface-variant hover:bg-outline-variant/30 text-on-surface-variant rounded-md text-xs font-medium transition-colors"
                          title="Refresh Preview"
                       >
                         <RefreshCw className="w-3 h-3" /> Refresh
                       </button>
                     )}
                   </div>
                   <span className="font-caption text-xs text-on-surface-variant">
                     If it doesn't load securely, use the 'Open Document' button above.
                   </span>
                 </div>

                 <iframe 
                    key={refreshKey}
                    src={isAdmin ? getPreviewUrl(savedUrl) : savedUrl} 
                    title="Lesson Plans Document"
                    className="w-full flex-1 border-none bg-surface"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                 />
                 
                 {/* Overlay to inform users if doc isn't showing */}
                 <div className="absolute inset-x-0 bottom-0 top-[60px] pointer-events-none flex items-center justify-center z-[-1] bg-surface-container-lowest">
                   <div className="text-center p-8 max-w-md">
                     <FileText className="w-16 h-16 opacity-10 mx-auto mb-4" />
                     <h3 className="font-title text-xl text-on-surface font-bold mb-2">Google Docs Viewer</h3>
                     <p className="font-body text-on-surface-variant">
                       If the document does not render in this frame due to Google's security settings, please use the Open Document button above to view or edit it securely in a new tab.
                     </p>
                   </div>
                 </div>
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

