import re

with open('src/pages/Announcements.tsx', 'r') as f:
    content = f.read()

# Fix currentUserRole
content = content.replace("currentUserRole = u.role;", "currentUserRole = localStorage.getItem('current_role') || u.role;")

# Fix finalAnns fetch
content = content.replace("const finalAnns = await fetchVisibleAnnouncements(user, currentUserRole);", "const finalAnns = await fetchVisibleAnnouncements(userStr ? JSON.parse(userStr) : user, currentUserRole);")

with open('src/pages/Announcements.tsx', 'w') as f:
    f.write(content)
