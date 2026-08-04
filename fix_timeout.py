with open('src/lib/announcementUtils.ts', 'r') as f:
    content = f.read()

import re

# Replace the selectQuery definition
new_select = """const selectQuery = fields || `
        announcement_id,
        title,
        content,
        created_at,
        created_by,
        target_role_id,
        target_role_ids,
        target_class_ids,
        target_user_ids
     `;"""

content = re.sub(
    r'const selectQuery = fields \|\| `.*?`;',
    new_select,
    content,
    flags=re.DOTALL
)

with open('src/lib/announcementUtils.ts', 'w') as f:
    f.write(content)
