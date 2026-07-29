const fs = require('fs');
let code = fs.readFileSync('src/pages/PrincipalNewsletters.tsx', 'utf8');

// Fix parsing to include class_id explicitly
code = code.replace(
  `return { id: item.newsletter_id, title: item.title, author: item.author_id, ...JSON.parse(item.content || "{}"), date: formattedDate };`,
  `return { id: item.newsletter_id, title: item.title, author: item.author_id, class_id: item.class_id, ...JSON.parse(item.content || "{}"), date: formattedDate };`
);

code = code.replace(
  `return { id: item.newsletter_id, title: item.title, content: item.content, status: "Published", date: formattedDate };`,
  `return { id: item.newsletter_id, title: item.title, content: item.content, class_id: item.class_id, status: "Published", date: formattedDate };`
);

fs.writeFileSync('src/pages/PrincipalNewsletters.tsx', code);
console.log("Patched data load");
