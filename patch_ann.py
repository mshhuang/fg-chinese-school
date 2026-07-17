import re

with open('src/lib/announcementUtils.ts', 'r') as f:
    content = f.read()

target = "const { data: anns, error } = await supabase.from('announcements').select(selectQuery).order('created_at', { ascending: false });"
replacement = "const { data: anns, error } = await supabase.from('announcements').select(selectQuery).order('created_at', { ascending: false }).limit(100);"

if target in content:
    content = content.replace(target, replacement)
    with open('src/lib/announcementUtils.ts', 'w') as f:
        f.write(content)
    print("Patched announcementUtils.ts")
else:
    print("Target not found")
