const fs = require('fs');
let code = fs.readFileSync('src/components/layout/MainLayout.tsx', 'utf8');

code = code.replace(
    `{ icon: Database, Folder, label: "Database", href: "/builder/database" }`,
    `{ icon: Database, label: "Database", href: "/builder/database" }`
);

fs.writeFileSync('src/components/layout/MainLayout.tsx', code);
console.log("fixed");
