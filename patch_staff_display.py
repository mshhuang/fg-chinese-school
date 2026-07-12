import re

with open('src/pages/StaffAttendance.tsx', 'r') as f:
    content = f.read()

replacement = """                    <span className="font-bold text-on-surface-variant">Co-Teacher:</span> 
                    <span>
                       {(() => {
                          const allCoTeachers = [
                             ...(selectedClass.co_teacher_id && !(selectedClass.co_teachers || []).includes(selectedClass.co_teacher_id) ? [selectedClass.co_teacher_id] : []),
                             ...(selectedClass.co_teachers || [])
                          ];
                          if (allCoTeachers.length === 0) return 'TBD';
                          
                          return allCoTeachers.map(id => {
                             if (id === selectedClass.co_teacher_id && selectedClass.co_teacher) {
                                 return `${selectedClass.co_teacher.first_name || ''} ${selectedClass.co_teacher.last_name || ''}`.trim();
                             }
                             const u = coTeachersMap[id];
                             if (u) return `${u.first_name || ''} ${u.last_name || ''}`.trim();
                             
                             // try to check if it's the current user
                             const userStr = localStorage.getItem("user");
                             if (userStr) {
                                try {
                                    const parsedUser = JSON.parse(userStr);
                                    if (id === parsedUser.id) return "You";
                                } catch (e) {}
                             }
                             return 'Unknown';
                          }).join(', ');
                       })()}
                    </span>"""

content = re.sub(
    r'<span className="font-bold text-on-surface-variant">Co-Teacher:</span>\s*<span>\{selectedClass\.co_teacher \? `\$\{selectedClass\.co_teacher\.first_name\} \$\{selectedClass\.co_teacher\.last_name\}` : \'TBD\'\}</span>',
    replacement,
    content,
    flags=re.DOTALL
)

with open('src/pages/StaffAttendance.tsx', 'w') as f:
    f.write(content)
