const fs = require('fs');
let lines = fs.readFileSync('src/pages/PrincipalNewsletters.tsx', 'utf8').split('\n');
const startIdx = 495; // line 496
const endIdx = 506; // line 507

const newLines = `                       {showPdfModal.status === "Pending Approval" && (
                         <>
                           <button onClick={async () => { await handleApprove(showPdfModal.id); setPostModal({...showPdfModal, status: 'Approved'}); setSelectedClasses(showPdfModal.class_id ? [showPdfModal.class_id] : []); setShowPdfModal(null); }} className="bg-primary/10 text-primary hover:bg-primary/20 font-bold py-1.5 px-4 rounded-full transition-colors text-sm flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4" /> Approve & Post
                           </button>
                         </>
                       )}
                       {(showPdfModal.status === "Pending Approval" || showPdfModal.status === "Approved") && (
                           <button onClick={() => { handleReject(showPdfModal.id); setShowPdfModal(null); }} className="bg-error/10 text-error hover:bg-error/20 font-bold py-1.5 px-4 rounded-full transition-colors text-sm flex items-center gap-2">
                              <XCircle className="w-4 h-4" /> Reject
                           </button>
                       )}`;
lines.splice(startIdx, endIdx - startIdx + 1, newLines);
fs.writeFileSync('src/pages/PrincipalNewsletters.tsx', lines.join('\n'));
console.log('Fixed lines');
