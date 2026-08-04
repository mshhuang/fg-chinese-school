import re

with open('src/components/PhotoCarousel.tsx', 'r') as f:
    content = f.read()

# I will replace the entire duplicate block.
# Let's find the start of loadPhotos and end of loadPhotos correctly.
start_idx = content.find("const loadPhotos = async () => {")
end_idx = content.find("  useEffect(() => {\n        async function fetchClasses()")

replacement = """  const loadPhotos = async () => {
    let roleAll = await getPhotos(viewerRole, 'all_unfiltered');
    let data = await getPhotos(viewerRole, selectedClassFilter);
    
    // Additional filtering for teachers
    if (viewerRole === 'teacher' && currentUser) {
        try {
            const currentUserId = currentUser.id || currentUser.user_id;
            const realUserId = currentUserId?.startsWith('user_') ? currentUserId.replace('user_', '') : currentUserId;
            
            // Fetch all classes and filter locally to avoid Supabase array syntax issues
            const { data: clsData } = await supabase.from('classes').select('class_name, primary_teacher_id, co_teacher_id, co_teachers');
                
            if (clsData) {
                const teacherClasses = clsData.filter((c: any) => {
                    if (c.primary_teacher_id === realUserId || c.co_teacher_id === realUserId) return true;
                    if (c.co_teachers && Array.isArray(c.co_teachers) && c.co_teachers.includes(realUserId)) return true;
                    return false;
                });
                const teacherClassNames = teacherClasses.map((c: any) => c.class_name);
                
                const filterTeacherPhotos = (photos: any[]) => {
                    return photos.filter(p => {
                        if (p.audience_type === 'all') return true;
                        
                        // Check if photo belongs to teacher's classes
                        if (p.class_names && Array.isArray(p.class_names)) {
                            if (p.class_names.some((cn: string) => teacherClassNames.includes(cn))) return true;
                        }
                        if (p.class_name) {
                            const parts = p.class_name.split(',').map((s: string) => s.trim());
                            if (parts.some((cn: string) => teacherClassNames.includes(cn))) return true;
                        }
                        
                        return false;
                    });
                };
                
                roleAll = filterTeacherPhotos(roleAll);
                data = filterTeacherPhotos(data);
            }
        } catch (e) {
            console.error("Error filtering teacher classes", e);
        }
    }
    
    setAllRolePhotos(roleAll);
    setPhotos(data);
    if (data.length > 0 && currentIndex >= data.length) {
      setCurrentIndex(0);
    }
  };

"""

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + replacement + content[end_idx:]
    with open('src/components/PhotoCarousel.tsx', 'w') as f:
        f.write(content)
else:
    print("Could not find start or end index")

