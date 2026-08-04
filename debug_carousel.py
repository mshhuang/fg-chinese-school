import re

with open('src/components/PhotoCarousel.tsx', 'r') as f:
    content = f.read()

replacement = """
                roleAll = filterTeacherPhotos(roleAll);
                data = filterTeacherPhotos(data);
                console.log("Filtered photos for teacher:", data);
            }
"""

content = content.replace("""
                roleAll = filterTeacherPhotos(roleAll);
                data = filterTeacherPhotos(data);
            }""", replacement)

with open('src/components/PhotoCarousel.tsx', 'w') as f:
    f.write(content)

