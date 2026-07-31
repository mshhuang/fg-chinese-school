import re

for filepath in ['src/pages/PrincipalNewsletters.tsx', 'src/pages/TeacherNewsletters.tsx']:
    with open(filepath, 'r') as f:
        content = f.read()
        
    bad_handle = "if (!confirmed) return;"
    good_handle = "if (!confirmed) return;\n     if (!id) return;"
    
    if bad_handle in content:
        content = content.replace(bad_handle, good_handle, 1)
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Patched {filepath}")

