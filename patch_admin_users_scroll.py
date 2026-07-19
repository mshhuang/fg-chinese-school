with open('src/pages/AdminUsers.tsx', 'r') as f:
    content = f.read()

# Add it back to handleEdit
content = content.replace("setShowAdd(true);", "setShowAdd(true);\n    setTimeout(() => document.getElementById('edit-user-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);")

with open('src/pages/AdminUsers.tsx', 'w') as f:
    f.write(content)
