import re

with open('src/pages/TeacherAssignmentBoard.tsx', 'r') as f:
    content = f.read()

replacement = """          <optgroup label="My Classes (Lead & Co-Teacher)">
            {classes.filter(c => c.primary_teacher_id === user?.id || c.co_teacher_id === user?.id || (c.co_teachers || []).includes(user?.id)).map(c => (
              <option key={c.class_id} value={c.class_id}>{c.class_name}</option>
            ))}
          </optgroup>
          <optgroup label="Other Classes">
            {classes.filter(c => c.primary_teacher_id !== user?.id && c.co_teacher_id !== user?.id && !(c.co_teachers || []).includes(user?.id)).map(c => (
              <option key={c.class_id} value={c.class_id}>{c.class_name}</option>
            ))}
          </optgroup>"""

content = re.sub(
    r'<optgroup label="My Homeroom Classes">.*?</optgroup>\s*<optgroup label="All Other Classes \(Co-Teacher\)">.*?</optgroup>',
    replacement,
    content,
    flags=re.DOTALL
)

with open('src/pages/TeacherAssignmentBoard.tsx', 'w') as f:
    f.write(content)
