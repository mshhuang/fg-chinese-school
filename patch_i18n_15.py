with open('src/lib/i18n.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    if i + 1 in [14, 15, 17, 22]:
        continue
    new_lines.append(line)

with open('src/lib/i18n.tsx', 'w') as f:
    f.writelines(new_lines)
