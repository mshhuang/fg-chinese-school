with open('src/pages/Announcements.tsx', 'r') as f:
    content = f.read()

content = content.replace('onClick={() => setConfirmDeleteId(ann.announcement_id)}', 'onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(ann.announcement_id); }}')
content = content.replace('''                                                 onClick={() => {
                                                    setEditingAnnId(ann.announcement_id);''', '''                                                 onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingAnnId(ann.announcement_id);''')

with open('src/pages/Announcements.tsx', 'w') as f:
    f.write(content)
