import re

with open('src/pages/TeacherDashboard.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '<PhotoCarousel showTeacherUpload={true} currentUser={user} />',
    '<PhotoCarousel showTeacherUpload={true} currentUser={user} viewerRole="teacher" />'
)

with open('src/pages/TeacherDashboard.tsx', 'w') as f:
    f.write(content)
