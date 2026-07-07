import re

files_to_fix = [
    ('src/pages/PrincipalDashboard.tsx', 'principal'),
    ('src/pages/StaffDashboard.tsx', 'staff'),
    ('src/pages/StudentPortal.tsx', 'student'),
    ('src/pages/TeacherDashboard.tsx', 'teacher'),
    ('src/pages/VolunteerDashboard.tsx', 'volunteer')
]

for filepath, default_role in files_to_fix:
    with open(filepath, 'r') as f:
        content = f.read()
        
    # Replace "localStorage.getItem('current_role') || userRole || '{default_role}'" 
    # with "localStorage.getItem('current_role') || '{default_role}'"
    content = content.replace(f"localStorage.getItem('current_role') || userRole || '{default_role}'", 
                              f"localStorage.getItem('current_role') || '{default_role}'")
                              
    # Same for user:
    # "localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : user"
    # Some files might not have `user` defined, so we just use the localStorage directly.
    # Wait, StudentPortal uses `user` which is passed as a string or object? Wait, StudentPortal has `user`.
    # Let's just fix the " || userRole " part first.
    
    with open(filepath, 'w') as f:
        f.write(content)
