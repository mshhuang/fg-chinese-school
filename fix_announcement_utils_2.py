import re

with open('src/lib/announcementUtils.ts', 'r') as f:
    content = f.read()

target = '''         const { data: classTeachers } = await supabase.from('class_teachers').select('class_id').eq('teacher_id', user.id);
         if (classTeachers) {
             classTeachers.forEach(ct => {
                 if (!userClassIds.includes(ct.class_id)) {
                     userClassIds.push(ct.class_id);
                 }
             });
         }'''

replacement = '''         const { data: allClasses } = await supabase.from('classes').select('class_id, co_teacher_id, co_teachers');
         if (allClasses) {
             allClasses.forEach(c => {
                 if (c.co_teacher_id === user.id || (c.co_teachers && c.co_teachers.includes(user.id))) {
                     if (!userClassIds.includes(c.class_id)) {
                         userClassIds.push(c.class_id);
                     }
                 }
             });
         }'''

new_content = content.replace(target, replacement)

with open('src/lib/announcementUtils.ts', 'w') as f:
    f.write(new_content)
