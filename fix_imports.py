import re
with open('src/pages/Announcements.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { Settings, ", "import { ")
content = content.replace('import { Megaphone, ', 'import { Settings, Megaphone, ', 1) # Just put it on the first one

with open('src/pages/Announcements.tsx', 'w') as f:
    f.write(content)
