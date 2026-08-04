import re

with open('src/components/PhotoCarousel.tsx', 'r') as f:
    content = f.read()

print(re.findall(r'async function fetchClasses.*?\}', content, flags=re.DOTALL))
