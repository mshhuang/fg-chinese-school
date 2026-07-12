import re

with open('src/pages/PrincipalClasses.tsx', 'r') as f:
    content = f.read()

pattern = r"""  const handleCoTeacherChange = async \(classId: string, teacherIds: string\[\]\) => \{.*?\n  \};"""
replacement = """  const handleCoTeacherChange = async (classId: string, teacherId: string) => {
    const value = teacherId || null;
    const { error } = await supabase.from('classes').update({ co_teacher_id: value }).eq('class_id', classId);
    if (error) {
      alert("Error updating co-teacher: " + error.message);
      return;
    }
    
    const updatedCoTeacher = teachers.find(t => t.user_id === teacherId);
    setClassesData(classesData.map(c => 
      c.class_id === classId 
        ? { ...c, co_teacher_id: value, co_teacher: updatedCoTeacher }
        : c
    ));
  };"""

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('src/pages/PrincipalClasses.tsx', 'w') as f:
    f.write(content)
