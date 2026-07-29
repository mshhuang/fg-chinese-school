const fs = require('fs');
let code = fs.readFileSync('src/pages/PrincipalNewsletters.tsx', 'utf8');

// Change the Approve button to 'Approve & Post' which approves AND opens the post modal
const target = `<button onClick={() => { handleApprove(showPdfModal.id); setShowPdfModal(null); }} className="bg-primary/10 text-primary hover:bg-primary/20 font-bold py-1.5 px-4 rounded-full transition-colors text-sm flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4" /> Approve
                           </button>`;

const replacement = `<button onClick={async () => { await handleApprove(showPdfModal.id); setPostModal({...showPdfModal, status: 'Published'}); setSelectedClasses(showPdfModal.class_id ? [showPdfModal.class_id] : []); setShowPdfModal(null); }} className="bg-primary/10 text-primary hover:bg-primary/20 font-bold py-1.5 px-4 rounded-full transition-colors text-sm flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4" /> Approve & Post
                           </button>`;

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/PrincipalNewsletters.tsx', code);
console.log('Patched UX');
