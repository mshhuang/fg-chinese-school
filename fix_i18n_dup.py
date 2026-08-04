import re

with open('src/lib/i18n.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
seen_keys = set()
for line in lines:
    match = re.search(r'^\s*"([^"]+)":', line)
    if match:
        key = match.group(1)
        if key in seen_keys:
            continue
        seen_keys.add(key)
    new_lines.append(line)

with open('src/lib/i18n.tsx', 'w') as f:
    f.writelines(new_lines)
