import re

with open('src/pages/TeacherClasses.tsx', 'r') as f:
    content = f.read()

replacements = [
    (r'"Homeroom Teacher"', r't("Homeroom Teacher")'),
    (r'"Co-Teacher"', r't("Co-Teacher")'),
    (r'"Active"', r't("Active")'),
    (r'Co-Teacher:', r'{t("Co-Teacher")}:'),
    (r'"Schedule TBD"', r't("Schedule TBD")'),
    (r'"Room TBD"', r't("Room TBD")'),
    (r'>Schedule TBD<', r'>{t("Schedule TBD")}<'),
    (r'>Room TBD<', r'>{t("Room TBD")}<'),
    (r'>Attendance<', r'>{t("Attendance")}<'),
    (r'>Assign Homework ', r'>{t("Assign Homework")} '),
    (r'placeholder="Search classes\.\.\."', r'placeholder={t("Search classes...")}'),
    (r'>School-wide Schedule<', r'>{t("School-wide Schedule")}<'),
    (r'> View Full Size<', r'> {t("View Full Size")}<'),
]

# Specifically handle "Students Enrolled"
content = re.sub(
    r'>(\{cls\.enrollments\?\.\[0\]\?\.count \|\| 0\}) Students Enrolled<',
    r'>\1 {t("Students Enrolled")}<',
    content
)

for old, new in replacements:
    content = content.replace(old, new)

with open('src/pages/TeacherClasses.tsx', 'w') as f:
    f.write(content)
