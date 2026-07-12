import re

with open('src/pages/StaffAttendance.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '<div className="flex flex-wrap gap-4 mb-8 w-full">',
    '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 w-full">'
)

content = content.replace(
    'className="flex-1 min-w-[300px] max-w-[380px] bg-white border border-primary/50 rounded-full p-2.5 flex items-center justify-between hover:shadow-md hover:border-primary transition-all cursor-pointer group"',
    'className="w-full bg-white border border-primary/50 rounded-full p-2.5 flex items-center justify-between hover:shadow-md hover:border-primary transition-all cursor-pointer group"'
)

with open('src/pages/StaffAttendance.tsx', 'w') as f:
    f.write(content)
