import re
with open('src/pages/AdminReports.tsx', 'r') as f:
    content = f.read()

content = content.replace('{cls.class_name}', '{cls.class_name || cls.name}')
with open('src/pages/AdminReports.tsx', 'w') as f:
    f.write(content)
print("cls.name patched")
