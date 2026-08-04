import re

with open('src/components/PhotoCarousel.tsx', 'r') as f:
    content = f.read()

replacement = """  const loadPhotos = async () => {
    let roleAll = await getPhotos(viewerRole, 'all_unfiltered');
    let data = await getPhotos(viewerRole, selectedClassFilter);
    
    // Additional filtering for teachers
    if (viewerRole === 'teacher' && currentUser) {
        try {
            const currentUserId = currentUser.id || currentUser.user_id;
            const realUserId = currentUserId?.startsWith('user_') ? currentUserId.replace('user_', '') : currentUserId;
            
            const { data: clsData } = await supabase.from('classes')
                .select('class_name')
                .or(`primary_teacher_id.eq.${realUserId},co_teacher_id.eq.${realUserId},co_teachers.cs.{${realUserId}}`);
                
            if (clsData) {
                const teacherClassNames = clsData.map((c: any) => c.class_name);
                
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
  };"""

content = re.sub(r'const loadPhotos = async \(\) => \{.*?\};', replacement, content, flags=re.DOTALL)

with open('src/components/PhotoCarousel.tsx', 'w') as f:
    f.write(content)

