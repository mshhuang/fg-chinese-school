import re

with open('src/pages/TeacherDashboard.tsx', 'r') as f:
    content = f.read()

pattern = r"\{recentAnnouncements\.length > 0 \? recentAnnouncements\.map\(\(ann: any, idx: number\) => \("
replacement = """{[latestAnnouncement].filter(Boolean).length > 0 ? [latestAnnouncement].filter(Boolean).map((ann: any, idx: number) => ("""

content = re.sub(pattern, replacement, content)

with open('src/pages/TeacherDashboard.tsx', 'w') as f:
    f.write(content)
