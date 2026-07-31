import re

with open('src/lib/announcementUtils.ts', 'r') as f:
    content = f.read()

bad1 = ".then(res => res.data?.map(e => e.class_id) || []);"
good1 = ".then(res => (res.data?.map(e => e.class_id) || []) as string[]);"

bad2 = ".then(r => r.data?.map(e => e.class_id) || []);"
good2 = ".then(r => (r.data?.map(e => e.class_id) || []) as string[]);"

bad3 = ".then(res => res.data?.map(c => c.class_id) || []);"
good3 = ".then(res => (res.data?.map(c => c.class_id) || []) as string[]);"

content = content.replace(bad1, good1)
content = content.replace(bad2, good2)
content = content.replace(bad3, good3)

with open('src/lib/announcementUtils.ts', 'w') as f:
    f.write(content)

