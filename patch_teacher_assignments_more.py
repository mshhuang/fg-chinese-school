import re

with open('src/pages/TeacherAssignmentBoard.tsx', 'r') as f:
    content = f.read()

content = content.replace('-- Choose a class --', "-- {t('Choose a class')} --")
content = content.replace("label=\"My Classes (Lead & Co-Teacher)\"", "label={t('My Classes (Lead & Co-Teacher)')}")
content = content.replace("label=\"Other Classes\"", "label={t('Other Classes')}")
content = content.replace("{showAdd ? 'Cancel' : 'New Assignment'}", "{showAdd ? t('Cancel') : t('New Assignment')}")
content = content.replace("{editingId ? 'Edit Assignment' : 'Create New Assignment'}", "{editingId ? t('Edit Assignment') : t('Create New Assignment')}")
content = content.replace(">Title</label>", ">{t('Title')}</label>")

with open('src/pages/TeacherAssignmentBoard.tsx', 'w') as f:
    f.write(content)
