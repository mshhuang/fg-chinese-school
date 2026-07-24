import re

with open('src/pages/Announcements.tsx', 'r') as f:
    content = f.read()

target = """  const getRoleIcon = (roleName: string, sizeClass: string) => {
      switch (roleName) {
          case 'admin':
          case 'principal': return <AdminIconCustom className={sizeClass} />;
          case 'builder': return <BuilderIconCustom className={sizeClass} />;
          case 'teacher': return <TeacherIconCustom className={sizeClass} />;
          case 'parent': return <Home className={sizeClass} />;
          case 'staff': return <StaffIconCustom className={sizeClass} />;
          case 'volunteer': return <VolunteerIconCustom className={sizeClass} />;
          case 'student':
          default: return <StudentIconCustom className={sizeClass} />;
      }
  };"""

replacement = """  const getRoleIcon = (roleName: string, sizeClass: string) => {
      switch (roleName) {
          case 'System': return <Settings className={sizeClass} />;
          case 'admin':
          case 'principal': return <AdminIconCustom className={sizeClass} />;
          case 'builder': return <BuilderIconCustom className={sizeClass} />;
          case 'teacher': return <TeacherIconCustom className={sizeClass} />;
          case 'parent': return <Home className={sizeClass} />;
          case 'staff': return <StaffIconCustom className={sizeClass} />;
          case 'volunteer': return <VolunteerIconCustom className={sizeClass} />;
          case 'student':
          default: return <StudentIconCustom className={sizeClass} />;
      }
  };"""

content = content.replace(target, replacement)

# ensure Settings is imported
if " Settings," not in content and "{ Settings" not in content and " Settings " not in content:
    content = content.replace("import { ", "import { Settings, ")

with open('src/pages/Announcements.tsx', 'w') as f:
    f.write(content)
