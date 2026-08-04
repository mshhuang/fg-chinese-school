with open('src/pages/TeacherDashboard.tsx', 'r') as f:
    content = f.read()

content = content.replace('QR Scanner', '{t("QR Scanner")}')
content = content.replace("? 'Clock Out' : 'Clock In'", '? t("Clock Out") : t("Clock In")')

with open('src/pages/TeacherDashboard.tsx', 'w') as f:
    f.write(content)

with open('src/components/PhotoCarousel.tsx', 'r') as f:
    content = f.read()

content = content.replace('> Post Photo<', '> {t("Post Photo")}<')
content = content.replace("'Post Photo Highlight'", 't("Post Photo")')
content = content.replace("'Edit Photo Highlight'", 't("Edit Photo Highlight")')
content = content.replace('Photo Information', '{t("Photo Information")}')

with open('src/components/PhotoCarousel.tsx', 'w') as f:
    f.write(content)
