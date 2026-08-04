import re

with open('src/components/PhotoCarousel.tsx', 'r') as f:
    content = f.read()

print(re.search(r'const loadPhotos = async \(\) => \{.*?\};', content, flags=re.DOTALL).group(0))
