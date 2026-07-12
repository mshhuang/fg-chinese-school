import re

with open('src/pages/AdminReports.tsx', 'r') as f:
    content = f.read()

pattern = r"const volunteerNameStr = enrolledVolunteers\.map\(\(v: any\) => v \? formatTeacherName\(v\.first_name, v\.last_name\) : ''\)\.filter\(Boolean\)\.join\(\", \"\);"
replacement = """const volunteerNameStr = enrolledVolunteers.map((v: any) => v ? `${v.first_name || ''} ${v.last_name || ''}`.trim() : '').filter(Boolean).join(", ");"""
content = re.sub(pattern, replacement, content)

with open('src/pages/AdminReports.tsx', 'w') as f:
    f.write(content)
