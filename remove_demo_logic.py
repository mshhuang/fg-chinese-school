import re

with open('src/pages/Login.tsx', 'r') as f:
    content = f.read()

target = """      // DEMO BYPASS
      if (cleanEmail.toLowerCase() === 'demo' && cleanPassword === 'demo') {
         const sessionToken = crypto.randomUUID();
         const demoRole = 'admin';
         const demoUserRoles = ['admin', 'teacher', 'parent', 'student', 'staff', 'volunteer', 'builder'];
         localStorage.setItem('user', JSON.stringify({
            id: 'demo',
            user_id: 'demo',
            first_name: 'Demo',
            last_name: 'User',
            email: 'demo@example.com',
            user_name: 'demo',
            role: demoRole,
            availableRoles: demoUserRoles,
            sessionToken
         }));
         
         await logSystemEvent('info', 'Demo login successful', { email: 'demo' });
         
         navigate("/admin/dashboard");
         setIsLoading(false);
         return;
      }"""

content = content.replace(target, "")

with open('src/pages/Login.tsx', 'w') as f:
    f.write(content)
