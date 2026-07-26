const fs = require('fs');
let code = fs.readFileSync('src/components/layout/MainLayout.tsx', 'utf8');

code = code.replace(
    `{ icon: Database, label: "Database", href: "/builder/database" },`,
    `{ icon: Database, label: "Database", href: "/builder/database" }, { icon: Folder, label: "Storage Viewer", href: "/builder/storage" },`
);
fs.writeFileSync('src/components/layout/MainLayout.tsx', code);
console.log("fixed sidebar");
