import re

with open('src/components/layout/MainLayout.tsx', 'r') as f:
    content = f.read()

# Pattern for mobile and desktop logout buttons
content = re.sub(r"onClick=\{async \(\) => \{[\s\S]*?navigate\(\"\/\"\);\n\s*\}\}", "onClick={handleLogout}", content)

with open('src/components/layout/MainLayout.tsx', 'w') as f:
    f.write(content)
