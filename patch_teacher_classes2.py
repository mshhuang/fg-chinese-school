import re

with open('src/pages/TeacherClasses.tsx', 'r') as f:
    content = f.read()

# Fix the filter logic
filter_pattern = r"    if \(viewMode === 'my_classes' && c\.primary_teacher_id !== currentUserId && c\.co_teacher_id !== currentUserId\) return false;"
filter_replacement = """    if (viewMode === 'my_classes' && c.primary_teacher_id !== currentUserId && c.co_teacher_id !== currentUserId && !(c.co_teachers || []).includes(currentUserId)) return false;"""
content = re.sub(filter_pattern, filter_replacement, content)

# Fix the select
select_pattern = r"co_teacher:co_teacher_id\(first_name, last_name\)'\);"
select_replacement = "co_teacher:co_teacher_id(first_name, last_name), co_teachers');"
content = re.sub(select_pattern, select_replacement, content)

# Fix the render logic for co-teacher display
render_pattern = r"\{cls\.co_teacher_id === currentUserId\s*\?\s*'You \(Co-Teacher\)'\s*:\s*cls\.co_teacher\s*\?\s*formatTeacherName\(cls\.co_teacher\.first_name, cls\.co_teacher\.last_name, 'Teacher'\)\s*:\s*'None'\}"
render_replacement = """{(cls.co_teachers || []).includes(currentUserId) || cls.co_teacher_id === currentUserId 
                                 ? 'You (Co-Teacher)' 
                                 : (cls.co_teachers?.length > 0 
                                     ? `${cls.co_teachers.length + (cls.co_teacher_id && !cls.co_teachers.includes(cls.co_teacher_id) ? 1 : 0)} Co-Teachers` 
                                     : cls.co_teacher 
                                       ? formatTeacherName(cls.co_teacher.first_name, cls.co_teacher.last_name, 'Teacher') 
                                       : 'None')}"""
content = re.sub(render_pattern, render_replacement, content)

with open('src/pages/TeacherClasses.tsx', 'w') as f:
    f.write(content)
