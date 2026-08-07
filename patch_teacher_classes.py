import re

with open('src/pages/TeacherClasses.tsx', 'r') as f:
    text = f.read()

btn_regex = r"""                          \{cls\.primary_teacher_id === currentUserId && \(
                             <button onClick=\{\(\) => navigate\('/teacher/attendance', \{ state: \{ class: cls \} \}\)\} className="text-secondary font-label text-sm font-bold flex items-center gap-1 hover:underline">
                               Attendance
                             </button>
                          \)\}"""

text = re.sub(btn_regex, '', text)

with open('src/pages/TeacherClasses.tsx', 'w') as f:
    f.write(text)
