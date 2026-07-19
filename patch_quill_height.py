with open('src/pages/Announcements.tsx', 'r') as f:
    content = f.read()

content = content.replace('className="bg-surface text-base h-64 pb-10"', 'className="bg-surface text-base h-[400px] pb-12"')
content = content.replace('className="h-[300px] pb-10"', 'className="h-[500px] pb-12"')

with open('src/pages/Announcements.tsx', 'w') as f:
    f.write(content)
