with open('src/pages/TeacherDashboard.tsx', 'r') as f:
    content = f.read()

content = content.replace('title="{t("Teacher ID Badge")}"', 'title={t("Teacher ID Badge")}')
content = content.replace('>{t("Teacher ID Badge")}<', '>{t("Teacher ID Badge")}<') # just in case

with open('src/pages/TeacherDashboard.tsx', 'w') as f:
    f.write(content)
