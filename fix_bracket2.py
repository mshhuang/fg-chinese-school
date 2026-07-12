with open('src/pages/TeacherNewsletters.tsx', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if line.strip().startswith('const handleDelete = async'):
        lines.insert(i, '  };\n')
        break

with open('src/pages/TeacherNewsletters.tsx', 'w') as f:
    f.writelines(lines)
