const fs = require('fs');
let code = fs.readFileSync('src/pages/PrincipalNewsletters.tsx', 'utf8');

// allow reject button on Approved newsletters too in the main list
code = code.replace(
    /\{news\.status === "Pending Approval" && \(\s*<>\s*<button onClick=\{\(\) => handleApprove\(news\.id\)\}/g,
    `{news.status === "Pending Approval" && (
                                   <button onClick={() => handleApprove(news.id)} className="w-8 h-8 rounded-full hover:bg-primary-container/50 hover:text-primary flex items-center justify-center text-on-surface-variant transition-colors" title="Approve">
                                      <CheckCircle2 className="w-4 h-4" />
                                   </button>
                               )}
                               {(news.status === "Pending Approval" || news.status === "Approved") && (`
);

// and in the modal:
code = code.replace(
    /\{showPdfModal\.status === "Pending Approval" && \(\s*<>\s*<button onClick=\{async \(\) => \{ await handleApprove\(showPdfModal\.id\);/g,
    `{showPdfModal.status === "Pending Approval" && (
                           <button onClick={async () => { await handleApprove(showPdfModal.id); setPostModal({...showPdfModal, status: 'Approved'}); setSelectedClasses(showPdfModal.class_id ? [showPdfModal.class_id] : []); setShowPdfModal(null); }} className="bg-primary/10 text-primary hover:bg-primary/20 font-bold py-1.5 px-4 rounded-full transition-colors text-sm flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4" /> Approve & Post
                           </button>
                       )}
                       {(showPdfModal.status === "Pending Approval" || showPdfModal.status === "Approved") && (`
);

// add Undo button if Approved (to set back to Pending Approval)
const revertListTarget = `                                   <button onClick={() => handleReject(news.id)} className="w-8 h-8 rounded-full hover:bg-error-container/50 hover:text-error flex items-center justify-center text-on-surface-variant transition-colors" title="Reject">
                                      <XCircle className="w-4 h-4" />
                                   </button>
                                 </>
                               )}`;
const revertListReplace = `                                   <button onClick={() => handleReject(news.id)} className="w-8 h-8 rounded-full hover:bg-error-container/50 hover:text-error flex items-center justify-center text-on-surface-variant transition-colors" title="Reject">
                                      <XCircle className="w-4 h-4" />
                                   </button>
                                 </>
                               )}
                               {news.status === "Approved" && (
                                   <button onClick={() => handleRevert(news.id)} className="w-8 h-8 rounded-full hover:bg-surface-variant flex items-center justify-center text-on-surface-variant transition-colors" title="Revert to Pending">
                                      <Clock className="w-4 h-4" />
                                   </button>
                               )}`;
code = code.replace(revertListTarget, revertListReplace);

const revertModalTarget = `                              <XCircle className="w-4 h-4" /> Reject
                           </button>
                         </>
                       )}`;
const revertModalReplace = `                              <XCircle className="w-4 h-4" /> Reject
                           </button>
                         </>
                       )}
                       {showPdfModal.status === "Approved" && (
                           <button onClick={() => { handleRevert(showPdfModal.id); setShowPdfModal(null); }} className="bg-surface-variant text-on-surface hover:bg-surface-variant/80 font-bold py-1.5 px-4 rounded-full transition-colors text-sm flex items-center gap-2">
                              <Clock className="w-4 h-4" /> Revert to Pending
                           </button>
                       )}`;
code = code.replace(revertModalTarget, revertModalReplace);

// implement handleRevert
const handleApproveCode = `  const handleApprove = async (id: string | number) => {`;
const handleRevertCode = `  const handleRevert = async (id: string | number) => {
     const newsletter = newsletters.find(n => n.id === id);
     if (!newsletter) return;
     
     const updatedProps = { ...newsletter, status: "Pending Approval" };
     delete updatedProps.id;
     delete updatedProps.title;
     
     try {
         // @ts-ignore
         const { error } = await supabase.from('newsletters').update({
             content: JSON.stringify(updatedProps),
             status: updatedProps.status
         }).eq('newsletter_id', id);
         
         if (error) {
             if (error.code === '42501') alert("RLS blocks update. Please check table policies.");
             throw error;
         }
         await loadNewsletters();
     } catch (err) {
         console.error("Revert failed", err);
         alert("Failed to revert status.");
     }
  };

  const handleApprove = async (id: string | number) => {`;
code = code.replace(handleApproveCode, handleRevertCode);

fs.writeFileSync('src/pages/PrincipalNewsletters.tsx', code);
console.log('done');
