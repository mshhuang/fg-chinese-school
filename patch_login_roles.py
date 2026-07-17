import re

with open('src/pages/Login.tsx', 'r') as f:
    content = f.read()

target = """      let primaryRole = 'staff';
      // If user logs in with 1st letter of firstname + lastname, they act as a student
      if (isStudentUsername) {
          primaryRole = 'student';
          if (!userRoles.includes('student')) userRoles.push('student');
      } 
       // Otherwise fallback to their other assigned roles
      else if (userRoles.includes('admin')) {
         primaryRole = 'admin';
      } else if (userRoles.includes('teacher')) {
         primaryRole = 'teacher';
      } else if (userRoles.includes('builder')) {
         primaryRole = 'builder';
      } else if (userRoles.includes('student')) {
         primaryRole = 'student';
      } else if (userRoles.length > 0) {
         primaryRole = userRoles[0];
      }"""

replacement = """      let primaryRole = 'staff';
      
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

if target in content:
    content = content.replace(target, replacement)
    with open('src/pages/Login.tsx', 'w') as f:
        f.write(content)
    print("Replaced successfully.")
else:
    print("Target not found.")
