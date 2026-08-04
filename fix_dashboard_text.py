with open('src/pages/TeacherDashboard.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'homeroom classes and {assignedClasses.filter(c => c.primary_teacher_id !== (user?.user_id || user?.id)).length} co-teacher classes.</p>',
    '{t("homeroom classes and")} {assignedClasses.filter(c => c.primary_teacher_id !== (user?.user_id || user?.id)).length} {t("co-teacher classes.")}</p>'
)

with open('src/pages/TeacherDashboard.tsx', 'w') as f:
    f.write(content)
