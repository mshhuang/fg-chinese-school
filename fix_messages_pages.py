import re

for filename in ['src/pages/PrincipalMessages.tsx', 'src/pages/StaffMessages.tsx', 'src/pages/StudentMessages.tsx']:
    with open(filename, 'r') as f:
        content = f.read()

    content = content.replace('>Messages<', '>{t("Messages")}<')

    with open(filename, 'w') as f:
        f.write(content)
    print(f"Updated {filename}")
