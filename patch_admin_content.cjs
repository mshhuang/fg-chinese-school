const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminContent.tsx', 'utf8');

code = code.replace(
  /return extractPlainText\(parsed\.content \|\| parsed\.pdfName \|\| row\.content\);/,
  "const text = extractPlainText(parsed.content || parsed.pdfName || '');\n                                       return `[${parsed.status || 'No Status'}] ${parsed.audience ? `Audience: ${parsed.audience} - ` : ''}${text}` || extractPlainText(row.content);"
);

fs.writeFileSync('src/pages/AdminContent.tsx', code);
