import re

with open('src/pages/BuilderDashboard.tsx', 'r') as f:
    content = f.read()

target = """    { title: 'Password Reminders', desc: 'View and manage password reset requests.', icon: Unlock, href: '/builder/password-reminders', color: 'text-primary', bg: 'bg-primary-container' }"""

replacement = """    { title: 'Password Reminders', desc: 'View and manage password reset requests.', icon: Unlock, href: '/builder/password-reminders', color: 'text-primary', bg: 'bg-primary-container' },
    { title: 'Report Editor', desc: 'Create and edit custom system reports.', icon: Server, href: '/builder/report-editor', color: 'text-primary', bg: 'bg-primary-container' }"""

content = content.replace(target, replacement)

with open('src/pages/BuilderDashboard.tsx', 'w') as f:
    f.write(content)
