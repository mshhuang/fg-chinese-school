import re
with open('src/pages/BuilderDashboard.tsx', 'r') as f:
    content = f.read()

target = "    { title: 'Management', desc: 'System management and settings.', icon: Settings, href: '/builder/management', color: 'text-tertiary', bg: 'bg-tertiary-container' },"
replacement = """    { title: 'Announcements', desc: 'Manage and broadcast system-wide announcements.', icon: Megaphone, href: '/builder/announcements', color: 'text-primary', bg: 'bg-primary-container' },
""" + target

content = content.replace(target, replacement)

# Add Megaphone to imports
if "Megaphone" not in content:
    content = content.replace("import { ", "import { Megaphone, ")

with open('src/pages/BuilderDashboard.tsx', 'w') as f:
    f.write(content)
