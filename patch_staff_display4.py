import re

with open('src/pages/StaffAttendance.tsx', 'r') as f:
    content = f.read()

replacement = """                          return allCoTeachers.map(id => {
                             // try to check if it's the current user
                             const userStr = localStorage.getItem("user");
                             if (userStr) {
                                try {
                                    const parsedUser = JSON.parse(userStr);
                                    if (id === parsedUser.id) return `You${parsedUser.first_name ? ` (${parsedUser.first_name} ${parsedUser.last_name || ''})` : ''}`;
                                } catch (e) {}
                             }
                             
                             if (id === selectedClass.co_teacher_id && selectedClass.co_teacher) {
                                 return `${selectedClass.co_teacher.first_name || ''} ${selectedClass.co_teacher.last_name || ''}`.trim();
                             }
                             const u = coTeachersMap[id];
                             if (u) return `${u.first_name || ''} ${u.last_name || ''}`.trim();
                             
                             return 'Unknown';
                          }).join(', ');"""

content = re.sub(
    r'return allCoTeachers\.map\(id => \{.*return \'Unknown\';\n\s*\}\)\.join\(\', \'\);',
    replacement,
    content,
    flags=re.DOTALL
)

with open('src/pages/StaffAttendance.tsx', 'w') as f:
    f.write(content)
