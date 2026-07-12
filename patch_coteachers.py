import re

with open('src/pages/PrincipalClasses.tsx', 'r') as f:
    content = f.read()

# Update the select query to also fetch co_teachers
select_pattern = r"co_teacher:co_teacher_id \(first_name, last_name\),"
select_replacement = "co_teacher:co_teacher_id (first_name, last_name),\n          co_teachers,"
content = re.sub(select_pattern, select_replacement, content)

handle_pattern = r"  const handleCoTeacherChange = async \(classId: string, teacherId: string\) => \{.*?\n  \};"
handle_replacement = """  const handleCoTeacherChange = async (classId: string, teacherIds: string[]) => {
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
  };"""
content = re.sub(handle_pattern, handle_replacement, content, flags=re.DOTALL)

render_pattern = r"""<h4 className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4 mt-6">Co-Teacher</h4>.*?<p className="font-body text-xs text-on-surface-variant mt-4 px-1">"""
render_replacement = """<h4 className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4 mt-6">Co-Teachers (Volunteers / Staff)</h4>
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
                                    {ct ? formatTeacherName(ct.first_name, ct.last_name) : 'Unknown'}
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
                                  <option key={t.user_id} value={t.user_id}>{formatTeacherName(t.first_name, t.last_name)}</option>
                               ))}
                            </select>
                         </div>
                      </div>
                   </div>
                   
                   <p className="font-body text-xs text-on-surface-variant mt-4 px-1">"""
content = re.sub(render_pattern, render_replacement, content, flags=re.DOTALL)

with open('src/pages/PrincipalClasses.tsx', 'w') as f:
    f.write(content)
