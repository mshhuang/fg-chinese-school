import re

with open('src/lib/i18n.tsx', 'r') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if line.startswith('const translations: Translations = {'):
        start_idx = i
    if start_idx != -1 and line.startswith('};'):
        end_idx = i
        break

if start_idx != -1 and end_idx != -1:
    seen_keys = set()
    deduped_lines = []
    
    # Process from top to bottom. Since newer keys were added at the top for some operations and at specific points for others, let's reverse to keep the MOST RECENT additions (assuming we added them near the top or they appeared earlier in the file). Actually, when we did `content.replace`, we inserted them near "New Announcement":. So let's keep the FIRST occurrence.
    for i in range(start_idx + 1, end_idx):
        line = lines[i]
        match = re.search(r'^\s*"([^"]+)"\s*:', line)
        if match:
            key = match.group(1)
            if key not in seen_keys:
                seen_keys.add(key)
                deduped_lines.append(line)
        else:
            deduped_lines.append(line)
            
    new_content = "".join(lines[:start_idx + 1]) + "".join(deduped_lines) + "".join(lines[end_idx:])
    with open('src/lib/i18n.tsx', 'w') as f:
        f.write(new_content)
    print("Deduplicated i18n keys successfully.")
else:
    print("Could not find translations object.")
