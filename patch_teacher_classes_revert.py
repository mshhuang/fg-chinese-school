import re

with open('src/pages/TeacherClasses.tsx', 'r') as f:
    content = f.read()

filter_pattern = r"""    if \(viewMode === 'my_classes' && c\.primary_teacher_id !== currentUserId && c\.co_teacher_id !== currentUserId && !\(c\.co_teachers \|\| \[\]\)\.includes\(currentUserId\)\) return false;"""
filter_replacement = """    if (viewMode === 'my_classes' && c.primary_teacher_id !== currentUserId && c.co_teacher_id !== currentUserId) return false;"""
content = re.sub(filter_pattern, filter_replacement, content)

render_pattern = r"""\{\(cls\.co_teachers \|\| \[\]\)\.includes\(currentUserId\) \|\| cls\.co_teacher_id === currentUserId \s*\?\s*'You \(Co-Teacher\)'\s*:\s*\(cls\.co_teachers\?\.length > 0 \s*\?\s*`\$\{cls\.co_teachers\.length\} Co-Teachers`\s*:\s*cls\.co_teacher \s*\?\s*formatTeacherName\(cls\.co_teacher\.first_name, cls\.co_teacher\.last_name, 'Teacher'\)\s*:\s*'None'\)\}"""
render_replacement = """{cls.co_teacher_id === currentUserId 
                                 ? 'You (Co-Teacher)' 
                                 : cls.co_teacher 
                                   ? formatTeacherName(cls.co_teacher.first_name, cls.co_teacher.last_name, 'Teacher') 
                                   : 'None'}"""
content = re.sub(render_pattern, render_replacement, content)

with open('src/pages/TeacherClasses.tsx', 'w') as f:
    f.write(content)
