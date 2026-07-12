import re

with open('src/pages/PrincipalClasses.tsx', 'r') as f:
    content = f.read()

co_teacher_pattern = r"  const handleCoTeacherChange = async \(classId: string, teacherId: string\) => \{.*?    \}\)\);\n  \};"

co_teacher_replacement = """  const handleCoTeacherChange = async (classId: string, teacherIds: string[]) => {
    const { error } = await supabase.from('classes').update({ co_teachers: teacherIds }).eq('class_id', classId);
    if (error) {
      if (error.message.includes('co_teachers')) {
          alert("Database schema needs to be updated to support multiple co-teachers. Please run the latest SQL from supabase_schema_updates.sql.");
      } else {
          alert("Error updating co-teachers: " + error.message);
      }
      return;
    }
    
    setClassesData(classesData.map(c => 
       c.class_id === classId 
         ? { ...c, co_teachers: teacherIds }
        : c
    ));
  };"""

content = re.sub(co_teacher_pattern, co_teacher_replacement, content, flags=re.DOTALL)

with open('src/pages/PrincipalClasses.tsx', 'w') as f:
    f.write(content)
