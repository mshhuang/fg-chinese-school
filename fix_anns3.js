import fs from 'fs';
let content = fs.readFileSync('src/pages/Announcements.tsx', 'utf8');

const targetStr = `      if (rolesRes.error) console.error('rolesRes err', rolesRes.error);
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
      const finalAnns = await fetchVisibleAnnouncements(parsedUser, currentUserRole);
      setAnnouncements(finalAnns || []);`;

const replaceStr = `      if (rolesRes.error) console.error('rolesRes err', rolesRes.error);
      if (classesRes.error) console.error('classesRes err', classesRes.error);

      if (rolesRes.data) {
        setRoles(rolesRes.data);
      }
      if (classesRes.data) setClasses(classesRes.data);

      setAnnouncements(finalAnns || []);`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replaceStr);
    fs.writeFileSync('src/pages/Announcements.tsx', content);
    console.log('Fixed successfully');
} else {
    console.log('Target string not found');
}
