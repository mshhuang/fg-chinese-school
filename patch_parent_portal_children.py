import re

with open('src/pages/ParentPortal.tsx', 'r') as f:
    content = f.read()

target = """      if (userEmail) {
         // Find all users with this email
         const { data: childrenByEmail, error: emailError } = await supabase
            .from('users')
            .select('user_id, first_name, last_name, grade')
            .eq('email', userEmail);
         if (!emailError && childrenByEmail && childrenByEmail.length > 0) {
            mappedChildren = childrenByEmail;
         }
      }"""

replacement = """      if (userEmail) {
         // Find all users with this email
         const { data: childrenByEmail, error: emailError } = await supabase
            .from('users')
            .select('user_id, first_name, last_name, grade')
            .eq('email', userEmail);
         if (!emailError && childrenByEmail && childrenByEmail.length > 0) {
            // Exclude the parent themselves from the children list
            mappedChildren = childrenByEmail.filter(c => c.user_id !== u.id);
         }
      }"""

if target in content:
    content = content.replace(target, replacement)
    with open('src/pages/ParentPortal.tsx', 'w') as f:
        f.write(content)
    print("Replaced successfully.")
else:
    print("Target not found.")

