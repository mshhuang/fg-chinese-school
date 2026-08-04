import re

with open('src/pages/AttendanceSheet.tsx', 'r') as f:
    content = f.read()

content = re.sub(r'Submit the student attendance by class for today\'s sessions\.', r'{t("Submit the student attendance by class for today\'s sessions.")}', content)
content = re.sub(r'\s+Select a Class\s+', r' {t("Select a Class")} ', content)
content = re.sub(r'\s+Ready to Go Home\s+', r' {t("Ready to Go Home")} ', content)

with open('src/pages/AttendanceSheet.tsx', 'w') as f:
    f.write(content)
