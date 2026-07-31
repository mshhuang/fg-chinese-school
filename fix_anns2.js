const fs = require('fs');
let content = fs.readFileSync('src/pages/Announcements.tsx', 'utf8');

// I need to find from "if (rolesRes.error)" down to "const finalAnns = await fetchVisibleAnnouncements(parsedUser, currentUserRole);" and remove the usersRes parts and duplicate parsedUser/finalAnns.

const targetRegex = /if \(usersRes\.error\) console\.error\('usersRes err', usersRes\.error\);\s*if \(rolesRes\.data\) \{\s*setRoles\(rolesRes\.data\);\s*\}\s*if \(classesRes\.data\) setClasses\(classesRes\.data\);\s*if \(usersRes\.data\) \{[^}]*\}\s*\}\s*\/\/\s*Load announcements and their replies\s*const parsedUser = userStr \? JSON\.parse\(userStr\) : user;\s*const finalAnns = await fetchVisibleAnnouncements\(parsedUser, currentUserRole\);/g;

content = content.replace(targetRegex, `
      if (rolesRes.data) {
        setRoles(rolesRes.data);
      }
      if (classesRes.data) setClasses(classesRes.data);
`);

// The above regex might not match exactly due to spacing.
// Let's just do a simpler search and replace.
