with open('src/components/PhotoCarousel.tsx', 'r') as f:
    text = f.read()

text = text.replace('setSelectedClasses([SCHOOL_CLASSES[0]]);', "setSelectedClasses(viewerRole === 'teacher' && dbClasses.length > 0 ? [dbClasses[0]] : [SCHOOL_CLASSES[0]]);")

with open('src/components/PhotoCarousel.tsx', 'w') as f:
    f.write(text)
