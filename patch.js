const fs = require('fs');
let code = fs.readFileSync('src/pages/Announcements.tsx', 'utf8');
code = code.replace(/console\.log\("Rendering Announcements\. announcements\.length:", announcements\.length\); const filteredAnnouncements = announcements\.filter\(a => \{\n    const matchesSearch = a\.title\?\.toLowerCase\(\)\.includes\(searchQuery\.toLowerCase\(\)\) \|\| \n                          a\.content \? a\.content\.toLowerCase\(\)\.includes\(searchQuery\.toLowerCase\(\)\) : false\(searchQuery\.toLowerCase\(\)\);\n    const aud = extractAudienceFilter\(a\);\n    const matchesFilter = activeFilter === "All" \|\| aud === activeFilter;\n    return matchesSearch \&\& matchesFilter;\n  \}\);/g, `const filteredAnnouncements = announcements.filter(a => {
    const titleMatch = a.title ? a.title.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    const contentMatch = a.content ? a.content.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    const matchesSearch = titleMatch || contentMatch;
    const aud = extractAudienceFilter(a);
    const matchesFilter = activeFilter === "All" || aud === activeFilter;
    return matchesSearch && matchesFilter;
  });`);
fs.writeFileSync('src/pages/Announcements.tsx', code);
