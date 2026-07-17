import re

with open('src/pages/Login.tsx', 'r') as f:
    content = f.read()

pattern = re.compile(r"let primaryRole = 'staff';\s*// If user logs in with 1st letter.*?primaryRole = userRoles\[0\];\s*\}", re.DOTALL)

replacement = """let primaryRole = 'staff';
      
      if (userRoles.includes('admin')) {
         primaryRole = 'admin';
      } else if (userRoles.includes('teacher')) {
         primaryRole = 'teacher';
      } else if (userRoles.includes('builder')) {
         primaryRole = 'builder';
      } else if (userRoles.includes('student')) {
         primaryRole = 'student';
      } else if (isStudentUsername) {
         // If user logs in with 1st letter of firstname + lastname and has no other roles, default to student
         primaryRole = 'student';
         if (!userRoles.includes('student')) userRoles.push('student');
      } else if (userRoles.length > 0) {
         primaryRole = userRoles[0];
      }"""

if pattern.search(content):
    content = pattern.sub(replacement, content)
    with open('src/pages/Login.tsx', 'w') as f:
        f.write(content)
    print("Replaced successfully.")
else:
    print("Not found.")

