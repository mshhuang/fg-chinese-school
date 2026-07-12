import re

with open('src/pages/ParentPortal.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "`${activeChildInfo?.first_name || 'Student'} is in the school`",
    "`${children.find(c => c.user_id === activeChild)?.first_name || (activeChild === 'mei' ? 'Mei' : activeChild === 'wei' ? 'Wei' : 'Student')} is in the school`"
)

content = content.replace(
    "`${activeChildInfo?.first_name || 'Student'} is ready to go home`",
    "`${children.find(c => c.user_id === activeChild)?.first_name || (activeChild === 'mei' ? 'Mei' : activeChild === 'wei' ? 'Wei' : 'Student')} is ready to go home`"
)

with open('src/pages/ParentPortal.tsx', 'w') as f:
    f.write(content)
