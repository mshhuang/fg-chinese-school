import re

files = [
    'src/pages/StudentPortal.tsx',
    'src/pages/ParentPortal.tsx',
    'src/pages/TeacherDashboard.tsx',
    'src/pages/VolunteerDashboard.tsx',
    'src/pages/StaffDashboard.tsx',
    'src/pages/PrincipalDashboard.tsx'
]

for file in files:
    try:
        with open(file, 'r') as f:
            content = f.read()
            
        content = content.replace("userRole ||", "localStorage.getItem('current_role') || userRole ||")
        
        # In TeacherDashboard, it might be: userRole || 'teacher'
        # userRole || 'student'
        
        with open(file, 'w') as f:
            f.write(content)
    except:
        pass
