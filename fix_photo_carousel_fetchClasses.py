import re

with open('src/components/PhotoCarousel.tsx', 'r') as f:
    content = f.read()

replacement = """    async function fetchClasses() {
      try {
        const { data } = await supabase.from('classes').select('class_name, primary_teacher_id, co_teacher_id, co_teachers');
        if (data) {
          let filteredClasses = data;
          if (viewerRole === 'teacher' && currentUser) {
              const currentUserId = currentUser.id || currentUser.user_id;
              const realUserId = currentUserId?.startsWith('user_') ? currentUserId.replace('user_', '') : currentUserId;
              
              filteredClasses = data.filter((c: any) => {
                  if (c.primary_teacher_id === realUserId || c.co_teacher_id === realUserId) return true;
                  if (c.co_teachers && Array.isArray(c.co_teachers) && c.co_teachers.includes(realUserId)) return true;
                  return false;
              });
          }
          const names = filteredClasses.map((c: any) => c.class_name).filter(Boolean);
          setDbClasses(names);
        }
      } catch (e) {}
    }"""

content = re.sub(r'async function fetchClasses\(\) \{.*?\n    \}', replacement, content, flags=re.DOTALL)

with open('src/components/PhotoCarousel.tsx', 'w') as f:
    f.write(content)

