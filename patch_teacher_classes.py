import re

with open('src/pages/TeacherClasses.tsx', 'r') as f:
    content = f.read()

replacement = """                          <div className="text-sm">
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
                          </div>"""

content = re.sub(
    r'<div className="text-sm">\s*<span className="font-bold text-on-surface-variant">Co-Teacher: </span>\s*<span className="text-on-surface font-medium">.*?</span>\s*</div>',
    replacement,
    content,
    flags=re.DOTALL
)

with open('src/pages/TeacherClasses.tsx', 'w') as f:
    f.write(content)
