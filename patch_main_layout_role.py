import re

with open('src/components/layout/MainLayout.tsx', 'r') as f:
    content = f.read()

content = content.replace("fetchVisibleAnnouncements(userInfo, userRole || '');", "fetchVisibleAnnouncements(userInfo, localStorage.getItem('current_role') || userRole || '');")

with open('src/components/layout/MainLayout.tsx', 'w') as f:
    f.write(content)
