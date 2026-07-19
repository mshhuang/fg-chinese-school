import re
with open('src/pages/AdminUsers.tsx', 'r') as f:
    content = f.read()

content = content.replace("setShowAdd(true);", "setShowAdd(true);\n    window.scrollTo({ top: 0, behavior: 'smooth' });")

with open('src/pages/AdminUsers.tsx', 'w') as f:
    f.write(content)
