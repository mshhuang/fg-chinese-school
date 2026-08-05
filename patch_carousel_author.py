with open('src/components/PhotoCarousel.tsx', 'r') as f:
    text = f.read()

replacement = """                const currentUserName = localUser?.name || localUser?.full_name || '';
                const filterPhotosByClasses = (photos: any[]) => {
                    return photos.filter(p => {
                        if (p.teacher_id === realUserId || (p.teacher_name && p.teacher_name === currentUserName)) return true;
                        if (p.audience_type === 'all' || p.class_name === 'School-Wide') return true;
                        if (p.class_names && Array.isArray(p.class_names)) {
                            if (p.class_names.some((cn: string) => myClassNames.includes(cn))) return true;
                        }
                        if (p.class_name) {
                            const parts = p.class_name.split(',').map((s: string) => s.trim());
                            if (parts.some((cn: string) => myClassNames.includes(cn))) return true;
                        }
                        return false;
                    });
                };"""

text = text.replace("""                const filterPhotosByClasses = (photos: any[]) => {
                    return photos.filter(p => {
                        if (p.audience_type === 'all' || p.class_name === 'School-Wide') return true;
                        if (p.class_names && Array.isArray(p.class_names)) {
                            if (p.class_names.some((cn: string) => myClassNames.includes(cn))) return true;
                        }
                        if (p.class_name) {
                            const parts = p.class_name.split(',').map((s: string) => s.trim());
                            if (parts.some((cn: string) => myClassNames.includes(cn))) return true;
                        }
                        return false;
                    });
                };""", replacement)

with open('src/components/PhotoCarousel.tsx', 'w') as f:
    f.write(text)
