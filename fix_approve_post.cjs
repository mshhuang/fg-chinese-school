const fs = require('fs');
let code = fs.readFileSync('src/pages/PrincipalNewsletters.tsx', 'utf8');

code = code.replace(
    /await handleApprove\(showPdfModal\.id\); setPostModal\(\{\.\.\.showPdfModal, status: 'Approved'\}\); setSelectedClasses\(showPdfModal\.class_id \? \[showPdfModal\.class_id\] : \[\]\);/g,
    'await handleApprove(showPdfModal.id);'
);

code = code.replace(
    /<CheckCircle2 className="w-4 h-4" \/> Approve & Post/g,
    '<CheckCircle2 className="w-4 h-4" /> Approve'
);

fs.writeFileSync('src/pages/PrincipalNewsletters.tsx', code);
console.log('done fixing approve post');
