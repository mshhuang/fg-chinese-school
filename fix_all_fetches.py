import os
import re

files_to_check = [
    'src/pages/TeacherDashboard.tsx',
    'src/pages/VolunteerDashboard.tsx',
    'src/pages/StaffDashboard.tsx',
    'src/pages/PrincipalDashboard.tsx',
    'src/pages/ParentPortal.tsx',
    'src/pages/StudentPortal.tsx',
    'src/components/layout/MainLayout.tsx',
    'src/components/DashboardNotifications.tsx'
]

for filepath in files_to_check:
    if not os.path.exists(filepath): continue
    
    with open(filepath, 'r') as f:
        content = f.read()
        
    # Replace any fetchVisibleAnnouncements(user, ...) with fetchVisibleAnnouncements(currentUser || user, ...) where applicable
    # But wait, each file is different.
    # It's better to just use JSON.parse(localStorage.getItem('user')) inline or pass the correct variable.
    # In TeacherDashboard, it's `fetchVisibleAnnouncements(user, ...)`
    content = content.replace("fetchVisibleAnnouncements(user,", "fetchVisibleAnnouncements(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : user,")
    # Also for 'u' in ParentPortal
    # Wait, in ParentPortal, 'u' is defined locally. Let's not touch it if it's 'u'.
    
    with open(filepath, 'w') as f:
        f.write(content)

