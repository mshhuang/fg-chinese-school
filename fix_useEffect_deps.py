import re

with open('src/components/PhotoCarousel.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "}, [viewerRole, selectedClassFilter]);",
    "}, [viewerRole, selectedClassFilter, currentUser]);"
)

with open('src/components/PhotoCarousel.tsx', 'w') as f:
    f.write(content)
