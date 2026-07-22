import re
with open('src/pages/AttendanceSheet.tsx', 'r') as f:
    content = f.read()

pattern = r"""       // Sync to student_clock_ins[\s\S]*?if \(clockInsToInsert\.length > 0\) \{[\s\S]*?\}"""

content = re.sub(pattern, "", content)
with open('src/pages/AttendanceSheet.tsx', 'w') as f:
    f.write(content)
