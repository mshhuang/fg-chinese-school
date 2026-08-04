import re
import os

with open('src/pages/StudentPortal.tsx', 'r') as f:
    content = f.read()

content = re.sub(r'Welcome back,\s*\{', r"{t('Welcome back,')} {", content)
content = re.sub(r'>\s*Daily Snapshot\s*<', r">{t('Daily Snapshot')}<", content)
content = re.sub(r'>\s*Student ID Badge\s*<', r">{t('Student ID Badge')}<", content)
content = re.sub(r"'Not Checked In'", r"t('Not Checked In')", content)
content = re.sub(r'>\s*Homework\s*<', r">{t('Homework')}<", content)
content = re.sub(r'>\s*Due tomorrow\s*<', r">{t('Due tomorrow')}<", content)
content = re.sub(r'>\s*Schedule\s*<', r">{t('Schedule')}<", content)
content = re.sub(r'>\s*Messages\s*<', r">{t('Messages')}<", content)
content = re.sub(r'>\s*unread messages\s*<', r">{t('unread messages')}<", content)
content = re.sub(r'>\s*Read More\s*<', r">{t('Read More')}<", content)

with open('src/pages/StudentPortal.tsx', 'w') as f:
    f.write(content)
