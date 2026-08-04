import re

with open('src/pages/ParentPortal.tsx', 'r') as f:
    content = f.read()

replacements = {
    'Welcome back, ': '{t(\'Welcome back,\')} ',
    "Here's what's happening with your children today.": "{t(\"Here's what's happening with your children today.\")}",
    "Daily Snapshot": "{t('Daily Snapshot')}",
    "Student ID Badge": "{t('Student ID Badge')}",
    "Not Checked In": "{t('Not Checked In')}",
    "Homework": "{t('Homework')}",
    "Due tomorrow": "{t('Due tomorrow')}",
    "Schedule": "{t('Schedule')}",
    "Messages": "{t('Messages')}",
    "unread messages": "{t('unread messages')}",
    "Read More": "{t('Read More')}"
}

for old, new in replacements.items():
    if not ('title="Student ID Badge"' in old):
        # We need to replace text nodes mostly
        content = content.replace(f">{old}<", f">{new}<")
        content = content.replace(f"> {old} <", f"> {new} <")
        content = content.replace(f">{old} <", f">{new} <")
        content = content.replace(f"> {old}<", f"> {new}<")
        
        # for "Welcome back, "
        content = content.replace("Welcome back, {", "{t('Welcome back,')} {")

with open('src/pages/ParentPortal.tsx', 'w') as f:
    f.write(content)
