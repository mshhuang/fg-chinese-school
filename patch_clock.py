import os
import re

def patch_file(filepath):
    if not os.path.exists(filepath):
        return
    with open(filepath, 'r') as f:
        content = f.read()
    
    orig = content
    content = content.replace("const processClockIn = async (reason: string) => {", "const processClockIn = async (reason: string) => {\n    if (clockStatus === 'loading') return;")
    content = content.replace("const processClockOut = async (reason: string) => {", "const processClockOut = async (reason: string) => {\n    if (clockStatus === 'loading') return;")
    
    if orig != content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Patched {filepath}")

patch_file('src/pages/TeacherDashboard.tsx')
patch_file('src/pages/VolunteerDashboard.tsx')

