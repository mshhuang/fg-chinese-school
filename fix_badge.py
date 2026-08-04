import re

with open('src/pages/TeacherDashboard.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'Teacher ID Badge',
    '{t("Teacher ID Badge")}'
)

with open('src/pages/TeacherDashboard.tsx', 'w') as f:
    f.write(content)


with open('src/lib/i18n.tsx', 'r') as f:
    content = f.read()

new_translations = """
  "Teacher ID Badge": { en: "Teacher ID Badge", 'zh-CN': "教师工作证", 'zh-TW': "教師工作證" },
"""

insert_pos = content.find('"New Announcement":')

if insert_pos != -1:
    content = content[:insert_pos] + new_translations + content[insert_pos:]
    with open('src/lib/i18n.tsx', 'w') as f:
        f.write(content)
