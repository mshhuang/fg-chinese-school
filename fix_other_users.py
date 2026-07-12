import re

files = [
    'src/pages/AdminUsers.tsx',
    'src/components/admin/FamilyTab.tsx',
    'src/components/admin/UserDirectoryTab.tsx'
]

for file in files:
    try:
        with open(file, 'r') as f:
            content = f.read()
        
        content = content.replace("supabase.from('users').select('*')", "supabase.from('users').select('user_id, first_name, last_name, email, phone1, status, user_name')")
        
        with open(file, 'w') as f:
            f.write(content)
    except FileNotFoundError:
        pass
