import re

with open('src/pages/Announcements.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "if (ann.roles?.role_name) auds.push(ann.roles.role_name); // legacy",
    "if (ann.target_role_id) { const r = roles.find(r => r.role_id === ann.target_role_id); if (r) auds.push(r.role_name); }"
)

content = content.replace(
    "if (ann.roles?.role_name) return ann.roles.role_name;",
    "if (ann.target_role_id) { const r = roles.find(r => r.role_id === ann.target_role_id); if (r) return r.role_name; }"
)

with open('src/pages/Announcements.tsx', 'w') as f:
    f.write(content)

