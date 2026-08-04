import re

with open('src/components/PhotoCarousel.tsx', 'r') as f:
    content = f.read()

# Modify selectAllClasses
content = content.replace(
    'const allCls = Array.from(new Set([...SCHOOL_CLASSES, ...dbClasses]));',
    'const allCls = viewerRole === "teacher" ? dbClasses : Array.from(new Set([...SCHOOL_CLASSES, ...dbClasses]));'
)

# Modify openNewPhotoModal
content = content.replace(
    '(photo.class_name ? photo.class_name.split(\',\').map(s => s.trim()).filter(Boolean) : [SCHOOL_CLASSES[0]]);',
    '(photo.class_name ? photo.class_name.split(\',\').map(s => s.trim()).filter(Boolean) : (viewerRole === "teacher" && dbClasses.length > 0 ? [dbClasses[0]] : [SCHOOL_CLASSES[0]]));'
)
content = content.replace(
    'const predefined = new Set([...SCHOOL_CLASSES, ...dbClasses]);',
    'const predefined = new Set(viewerRole === "teacher" ? dbClasses : [...SCHOOL_CLASSES, ...dbClasses]);'
)

# Modify filterClassOptions
content = content.replace(
    'Array.from(new Set([...SCHOOL_CLASSES, ...dbClasses, ...availableClassesInRolePhotos])).filter(c => c !== \'School-Wide\');',
    'Array.from(new Set(viewerRole === "teacher" ? [...dbClasses, ...availableClassesInRolePhotos] : [...SCHOOL_CLASSES, ...dbClasses, ...availableClassesInRolePhotos])).filter(c => c !== \'School-Wide\');'
)

# Modify Class Choice Chips
content = content.replace(
    '{Array.from(new Set([...SCHOOL_CLASSES, ...dbClasses])).map(cls => {',
    '{Array.from(new Set(viewerRole === "teacher" ? dbClasses : [...SCHOOL_CLASSES, ...dbClasses])).map(cls => {'
)

with open('src/components/PhotoCarousel.tsx', 'w') as f:
    f.write(content)

