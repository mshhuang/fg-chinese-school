import re

with open('src/pages/StaffAttendance.tsx', 'r') as f:
    content = f.read()

# Add formatTeacherName import
if "formatTeacherName" not in content:
    content = content.replace(
        'import { cn } from "../lib/utils";',
        'import { cn, formatTeacherName } from "../lib/utils";'
    )

content = content.replace(
    '<span>{selectedClass.users?.first_name} {selectedClass.users?.last_name}</span>',
    '<span>{formatTeacherName(selectedClass.users?.first_name, selectedClass.users?.last_name, "Teacher")}</span>'
)

# Fix "You" format
content = content.replace(
    'if (id === parsedUser.id) return `You${parsedUser.first_name ? ` (${parsedUser.first_name} ${parsedUser.last_name || \'\'})` : \'\'}`;',
    'if (id === parsedUser.id) return `You (${formatTeacherName(parsedUser.first_name, parsedUser.last_name, "Teacher")})`;'
)

# Fix co-teacher format
content = content.replace(
    'return `${selectedClass.co_teacher.first_name || \'\'} ${selectedClass.co_teacher.last_name || \'\'}`.trim();',
    'return formatTeacherName(selectedClass.co_teacher.first_name, selectedClass.co_teacher.last_name, "Teacher");'
)

content = content.replace(
    'if (u) return `${u.first_name || \'\'} ${u.last_name || \'\'}`.trim();',
    'if (u) return formatTeacherName(u.first_name, u.last_name, "Teacher");'
)

with open('src/pages/StaffAttendance.tsx', 'w') as f:
    f.write(content)
