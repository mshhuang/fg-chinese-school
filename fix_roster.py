import re

with open('src/pages/StaffAttendance.tsx', 'r') as f:
    content = f.read()

content = content.replace("                    Student Roster", "                    {t('Student Roster')}")

with open('src/pages/StaffAttendance.tsx', 'w') as f:
    f.write(content)
