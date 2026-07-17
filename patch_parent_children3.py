import re
import glob

for filename in ['src/pages/ParentGrades.tsx', 'src/pages/ParentSchedule.tsx']:
    with open(filename, 'r') as f:
        content = f.read()
    
    pattern = re.compile(r"if \(\!emailError && childrenByEmail && childrenByEmail\.length > 0\) \{\s*mappedChildren = childrenByEmail;\s*\}", re.DOTALL)
    
    replacement = """if (!emailError && childrenByEmail && childrenByEmail.length > 0) {
            mappedChildren = childrenByEmail.filter((c: any) => c.user_id !== u.id);
         }"""
    
    if pattern.search(content):
        content = pattern.sub(replacement, content)
        with open(filename, 'w') as f:
            f.write(content)
        print(f"Replaced successfully in {filename}.")
    else:
        print(f"Target not found in {filename}.")
