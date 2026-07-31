import re

with open('src/lib/announcementUtils.ts', 'r') as f:
    content = f.read()

target = '''     } else if (userRole === 'teacher') {
         const { data: classes } = await supabase.from('classes').select('class_id').eq('primary_teacher_id', user.id);
         if (classes) userClassIds = classes.map(c => c.class_id);
     }'''

replacement = '''     } else if (userRole === 'teacher') {
         const { data: classes } = await supabase.from('classes').select('class_id').eq('primary_teacher_id', user.id);
         if (classes) {
             userClassIds = classes.map(c => c.class_id);
         }
         
         const { data: classTeachers } = await supabase.from('class_teachers').select('class_id').eq('teacher_id', user.id);
         if (classTeachers) {
             classTeachers.forEach(ct => {
                 if (!userClassIds.includes(ct.class_id)) {
                     userClassIds.push(ct.class_id);
                 }
             });
         }
     }'''

new_content = content.replace(target, replacement)

with open('src/lib/announcementUtils.ts', 'w') as f:
    f.write(new_content)
