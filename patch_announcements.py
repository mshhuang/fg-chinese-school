import re

with open('src/pages/Announcements.tsx', 'r') as f:
    content = f.read()

bad_logic = """      // Load roles, classes, users for the compose dropdown
      const [rolesRes, classesRes, usersRes] = await Promise.all([
        supabase.from('roles').select('*'),
        supabase.from('classes').select('*'),
        supabase.from('users').select('user_id, first_name, last_name, email, user_roles(roles(role_name))')
      ]);"""

good_logic = """      // Load announcements immediately
      const parsedUser = userStr ? JSON.parse(userStr) : user;
      
      const [finalAnns, rolesRes, classesRes] = await Promise.all([
          fetchVisibleAnnouncements(parsedUser, currentUserRole),
          supabase.from('roles').select('*'),
          supabase.from('classes').select('*')
      ]);
      
      // Load users for the compose dropdown in the background
      supabase.from('users').select('user_id, first_name, last_name, email, user_roles(roles(role_name))').then(({data, error}) => {
          if (!error && data) {
              const formattedUsers = data.map(u => ({
                  ...u,
                  role_names: (u.user_roles || []).map((ur: any) => ur.roles?.role_name).filter(Boolean)
              })).filter((u: any) => !(u.first_name === 'Youlin' && u.last_name === 'Venerable'));
              setAvailableUsers(formattedUsers);
          }
      });"""

content = content.replace(bad_logic, good_logic)

# Remove the old metaRes processing block that we moved/modified
old_meta_process = """
      if (rolesRes.error) console.error('rolesRes err', rolesRes.error);
      if (classesRes.error) console.error('classesRes err', classesRes.error);
      if (usersRes.error) console.error('usersRes err', usersRes.error);
      
      if (rolesRes.data) {
        setRoles(rolesRes.data);
      }
      if (classesRes.data) setClasses(classesRes.data);
      
      if (usersRes.data) {
        const formattedUsers = usersRes.data.map(u => ({
          ...u,
          role_names: (u.user_roles || []).map((ur: any) => ur.roles?.role_name).filter(Boolean)
        })).filter((u: any) => !(u.first_name === 'Youlin' && u.last_name === 'Venerable'));
        setAvailableUsers(formattedUsers);
      }
      
      // Load announcements and their replies
      const parsedUser = userStr ? JSON.parse(userStr) : user;
      const finalAnns = await fetchVisibleAnnouncements(parsedUser, currentUserRole);"""

new_meta_process = """
      if (rolesRes.error) console.error('rolesRes err', rolesRes.error);
      if (classesRes.error) console.error('classesRes err', classesRes.error);
      
      if (rolesRes.data) {
        setRoles(rolesRes.data);
      }
      if (classesRes.data) setClasses(classesRes.data);
"""
content = content.replace(old_meta_process, new_meta_process)

with open('src/pages/Announcements.tsx', 'w') as f:
    f.write(content)

