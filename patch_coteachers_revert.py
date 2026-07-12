import re

with open('src/pages/PrincipalClasses.tsx', 'r') as f:
    content = f.read()

# Replace the Co-Teacher block
pattern = r"""<h4 className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4 mt-6">Co-Teachers \(Volunteers / Staff\)</h4>.*?<p className="font-body text-xs text-on-surface-variant mt-4 px-1">"""

replacement = """<h4 className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4 mt-6">Co-Teacher</h4>
                   <div className="flex items-center gap-4 bg-surface px-4 py-3 rounded-2xl border border-outline-variant/30">
                      <div className="w-12 h-12 rounded-full border-2 border-surface shadow-sm bg-surface-variant flex items-center justify-center font-bold text-lg text-on-surface-variant overflow-hidden shrink-0">
                         {activeClass?.co_teacher ? activeClass.co_teacher.first_name?.[0] : '?'}
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                         <select 
                            value={activeClass?.co_teacher_id || ""}
                            onChange={(e) => activeClass && handleCoTeacherChange(activeClass.class_id, e.target.value)}
                            className="font-title text-base font-bold text-on-surface bg-transparent border-none outline-none cursor-pointer focus:ring-1 focus:ring-primary rounded px-1 -ml-1 w-full truncate"
                         >
                            <option value="">None (TBD)</option>
                            {teachers.map(t => (
                               <option key={t.user_id} value={t.user_id}>{formatTeacherName(t.first_name, t.last_name)}</option>
                            ))}
                         </select>
                      </div>
                   </div>
                   
                   <p className="font-body text-xs text-on-surface-variant mt-4 px-1">"""

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('src/pages/PrincipalClasses.tsx', 'w') as f:
    f.write(content)
