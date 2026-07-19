import re

with open('src/components/layout/MainLayout.tsx', 'r') as f:
    content = f.read()

target = """      .on('postgres_changes', { event: '*', schema: 'public', table: 'assignment_students' }, () => {
         debouncedFetchUnread();
      })"""

replacement = """      .on('postgres_changes', { event: '*', schema: 'public', table: 'assignment_students' }, () => {
         debouncedFetchUnread();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'newsletters' }, () => {
         debouncedFetchUnread();
      })"""

if target in content:
    content = content.replace(target, replacement)
    with open('src/components/layout/MainLayout.tsx', 'w') as f:
        f.write(content)
    print("Patched MainLayout.tsx")
else:
    print("Target not found!")
