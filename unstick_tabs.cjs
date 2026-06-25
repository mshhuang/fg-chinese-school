const fs = require('fs');
const files = [
  { path: 'src/pages/AdminDataEntry.tsx', search: 'sticky top-[72px] z-20 flex p-1.5', replace: 'flex p-1.5' },
  { path: 'src/pages/AdminAcademic.tsx', search: 'sticky top-[72px] z-20 flex p-1.5', replace: 'flex p-1.5' },
  { path: 'src/pages/AdminContent.tsx', search: 'sticky top-[72px] z-20 flex p-1.5', replace: 'flex p-1.5' },
  { path: 'src/pages/AdminUsers.tsx', search: 'sticky top-6 z-20 flex p-1.5', replace: 'flex p-1.5' }
];

files.forEach(f => {
  if (fs.existsSync(f.path)) {
    let content = fs.readFileSync(f.path, 'utf8');
    content = content.replace(f.search, f.replace);
    fs.writeFileSync(f.path, content);
  }
});
