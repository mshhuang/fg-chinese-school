import re

with open('src/pages/PrincipalClasses.tsx', 'r') as f:
    content = f.read()

# Replace the Co-Teacher block
pattern = r"""(<h4 className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4 mt-6">Co-Teacher</h4>\s*<div className="flex items-center gap-4 bg-surface px-4 py-3 rounded-2xl border border-outline-variant/30">.*?</div>\s*</div>)"""

replacement = """<h4 className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4 mt-6">Co-Teachers (Volunteers / Staff)</h4>
                   <div className="flex flex-col gap-3">
                      {(activeClass?.co_teachers || []).map((ct_id: string) => {
                         const ct = teachers.find(t => t.user_id === ct_id);
                         if (!ct) return null;
                         return (
                           <div key={ct_id} className="flex items-center gap-4 bg-surface px-4 py-3 rounded-2xl border border-outline-variant/30">
                              <div className="w-10 h-10 rounded-full border-2 border-surface shadow-sm bg-surface-variant flex items-center justify-center font-bold text-sm text-on-surface-variant overflow-hidden shrink-0">
                                 {ct.first_name?.[0]}
                              </div>
                              <div className="flex flex-col flex-1 min-w-0">
                                 <div className="font-title text-base font-bold text-on-surface truncate">
                                    {formatTeacherName(ct.first_name, ct.last_name)}
                                 </div>
                              </div>
                              <button
                                 onClick={() => {
                                    if (!activeClass) return;
                                    const newArr = (activeClass.co_teachers || []).filter((id: string) => id !== ct_id);
                                    handleCoTeacherChange(activeClass.class_id, newArr);
                                 }}
                                 className="w-8 h-8 rounded-full bg-error-container text-on-error-container hover:bg-error-container/80 flex items-center justify-center transition-colors shrink-0"
                              >
                                 <X className="w-4 h-4" />
                              </button>
                           </div>
                         );
                      })}
                      
                      <div className="flex items-center gap-4 bg-surface px-4 py-3 rounded-2xl border border-outline-variant/30 border-dashed">
                         <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant shrink-0">
                            <Plus className="w-5 h-5" />
                         </div>
                         <div className="flex flex-col flex-1 min-w-0">
                            <select 
                               value=""
                               onChange={(e) => {
                                  if (!activeClass || !e.target.value) return;
                                  const newArr = [...(activeClass.co_teachers || []), e.target.value];
                                  handleCoTeacherChange(activeClass.class_id, newArr);
                               }}
                               className="font-title text-sm font-bold text-on-surface-variant bg-transparent border-none outline-none cursor-pointer focus:ring-1 focus:ring-primary rounded px-1 -ml-1 w-full truncate"
                            >
                               <option value="">Add Co-Teacher...</option>
                               {teachers.filter(t => !(activeClass?.co_teachers || []).includes(t.user_id)).map(t => (
                                  <option key={t.user_id} value={t.user_id}>{formatTeacherName(t.first_name, t.last_name)}</option>
                               ))}
                            </select>
                         </div>
                      </div>
                   </div>"""

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('src/pages/PrincipalClasses.tsx', 'w') as f:
    f.write(content)
