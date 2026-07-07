import re

files_to_fix = [
    'src/pages/StaffDashboard.tsx',
    'src/pages/VolunteerDashboard.tsx'
]

for filepath in files_to_fix:
    with open(filepath, 'r') as f:
        content = f.read()
        
    content = content.replace("localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : user",
                              "localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null")
                              
    with open(filepath, 'w') as f:
        f.write(content)
