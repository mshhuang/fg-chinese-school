import re

for filepath in ['src/pages/TeacherNewsletters.tsx', 'src/pages/PrincipalNewsletters.tsx']:
    with open(filepath, 'r') as f:
        content = f.read()

    # Remove accept=".pdf,.doc,.docx,.txt,image/*,.heic"
    content = re.sub(r'accept="[^"]+"', '', content)

    with open(filepath, 'w') as f:
        f.write(content)
    
    print(f"Patched accept in {filepath}")
