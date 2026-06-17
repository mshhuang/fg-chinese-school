const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminEnrollments.tsx', 'utf8');

content = content.replace(
  '<button type="submit" className="bg-primary hover:bg-primary/90 text-on-primary px-8 py-3 rounded-full font-label font-bold shadow-sm transition-colors">',
  '<button type="button" onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-on-primary px-8 py-3 rounded-full font-label font-bold shadow-sm transition-colors">'
);

fs.writeFileSync('src/pages/AdminEnrollments.tsx', content);
