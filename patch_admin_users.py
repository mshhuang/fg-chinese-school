import re

with open('src/pages/AdminUsers.tsx', 'r') as f:
    content = f.read()

target = "const { data, error } = await supabase.from('roles').select('role_id, role_name, icon_name').order('role_id', { ascending: false });"
replacement = "const { data, error } = await supabase.from('roles').select('role_id, role_name').order('role_id', { ascending: false });"

if target in content:
    content = content.replace(target, replacement)
    with open('src/pages/AdminUsers.tsx', 'w') as f:
        f.write(content)
    print("Replaced successfully.")
else:
    print("Target not found.")

