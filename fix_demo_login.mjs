import fs from 'fs';
let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');

const replacement = `
      const cleanEmail = email.trim();
      const cleanPassword = password.trim();
      
      // DEMO BYPASS
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
      }

      // Manual auth against the 'users' table since we use it to store users
`;

content = content.replace(`
      const cleanEmail = email.trim();
      const cleanPassword = password.trim();
      
      // Manual auth against the 'users' table since we use it to store users
`, replacement);

fs.writeFileSync('src/pages/Login.tsx', content);
