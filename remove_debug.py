import re

with open('src/components/PhotoCarousel.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '                console.log("Filtered photos for teacher:", data);\n',
    ''
)

with open('src/components/PhotoCarousel.tsx', 'w') as f:
    f.write(content)
