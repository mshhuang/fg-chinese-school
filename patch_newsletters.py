import re

with open('src/pages/TeacherNewsletters.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "const { data: classData } = await supabase.from('classes').select('class_id').eq('primary_teacher_id', authorId).maybeSingle();",
    "const { data: classData } = await supabase.from('classes').select('class_id').or(`primary_teacher_id.eq.${authorId},co_teacher_id.eq.${authorId},co_teachers.cs.{${authorId}}`).limit(1).maybeSingle();"
)

with open('src/pages/TeacherNewsletters.tsx', 'w') as f:
    f.write(content)
