import re

with open('src/pages/StaffAttendance.tsx', 'r') as f:
    content = f.read()

content = content.replace("return `You (${parsedUser.first_name || ''} ${parsedUser.last_name || ''})`.trim();", "return `You${parsedUser.first_name ? ` (${parsedUser.first_name} ${parsedUser.last_name || ''})` : ''}`;")

with open('src/pages/StaffAttendance.tsx', 'w') as f:
    f.write(content)
