with open('src/components/PhotoCarousel.tsx', 'r') as f:
    text = f.read()

text = text.replace('viewerRole === "teacher" ? dbClasses', 'viewerRole === "teacher" && dbClasses.length > 0 ? dbClasses')

with open('src/components/PhotoCarousel.tsx', 'w') as f:
    f.write(text)
