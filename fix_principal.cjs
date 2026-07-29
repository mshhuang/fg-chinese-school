const fs = require('fs');
let code = fs.readFileSync('src/pages/PrincipalNewsletters.tsx', 'utf8');

const target1 = `{news.status === "Pending Approval" && (
                                   <button onClick={() => handleApprove(news.id)} className="w-8 h-8 rounded-full hover:bg-primary-container/50 hover:text-primary flex items-center justify-center text-on-surface-variant transition-colors" title="Approve">
                                      <CheckCircle2 className="w-4 h-4" />
                                   </button>
                               )}
                               {(news.status === "Pending Approval" || news.status === "Approved") && ( className="w-8 h-8 rounded-full hover:bg-primary-container/50 hover:text-primary flex items-center justify-center text-on-surface-variant transition-colors" title="Approve">
                                      <CheckCircle2 className="w-4 h-4" />
                                   </button>
                                   <button onClick={() => handleReject(news.id)} className="w-8 h-8 rounded-full hover:bg-error-container/50 hover:text-error flex items-center justify-center text-on-surface-variant transition-colors" title="Reject">
                                      <XCircle className="w-4 h-4" />
                                   </button>
                                 </>
                               )}`;

const replace1 = `{news.status === "Pending Approval" && (
                                   <button onClick={() => handleApprove(news.id)} className="w-8 h-8 rounded-full hover:bg-primary-container/50 hover:text-primary flex items-center justify-center text-on-surface-variant transition-colors" title="Approve">
                                      <CheckCircle2 className="w-4 h-4" />
                                   </button>
                               )}
                               {(news.status === "Pending Approval" || news.status === "Approved") && (
                                   <button onClick={() => handleReject(news.id)} className="w-8 h-8 rounded-full hover:bg-error-container/50 hover:text-error flex items-center justify-center text-on-surface-variant transition-colors" title="Reject">
                                      <XCircle className="w-4 h-4" />
                                   </button>
                               )}`;

code = code.replace(target1, replace1);

const target2 = `{showPdfModal.status === "Pending Approval" && (
                           <button onClick={async () => { await handleApprove(showPdfModal.id); setPostModal({...showPdfModal, status: 'Approved'}); setSelectedClasses(showPdfModal.class_id ? [showPdfModal.class_id] : []); setShowPdfModal(null); }} className="bg-primary/10 text-primary hover:bg-primary/20 font-bold py-1.5 px-4 rounded-full transition-colors text-sm flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4" /> Approve & Post
                           </button>
                       )}
                       {(showPdfModal.status === "Pending Approval" || showPdfModal.status === "Approved") && ( className="bg-primary/10 text-primary hover:bg-primary/20 font-bold py-1.5 px-4 rounded-full transition-colors text-sm flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4" /> Approve & Post
                           </button>
                           <button onClick={() => { handleReject(showPdfModal.id); setShowPdfModal(null); }} className="bg-error/10 text-error hover:bg-error/20 font-bold py-1.5 px-4 rounded-full transition-colors text-sm flex items-center gap-2">
                              <XCircle className="w-4 h-4" /> Reject
                           </button>
                         </>
                       )}`;
const replace2 = `{showPdfModal.status === "Pending Approval" && (
                           <button onClick={async () => { await handleApprove(showPdfModal.id); setPostModal({...showPdfModal, status: 'Approved'}); setSelectedClasses(showPdfModal.class_id ? [showPdfModal.class_id] : []); setShowPdfModal(null); }} className="bg-primary/10 text-primary hover:bg-primary/20 font-bold py-1.5 px-4 rounded-full transition-colors text-sm flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4" /> Approve & Post
                           </button>
                       )}
                       {(showPdfModal.status === "Pending Approval" || showPdfModal.status === "Approved") && (
                           <button onClick={() => { handleReject(showPdfModal.id); setShowPdfModal(null); }} className="bg-error/10 text-error hover:bg-error/20 font-bold py-1.5 px-4 rounded-full transition-colors text-sm flex items-center gap-2">
                              <XCircle className="w-4 h-4" /> Reject
                           </button>
                       )}`;
code = code.replace(target2, replace2);

fs.writeFileSync('src/pages/PrincipalNewsletters.tsx', code);
console.log('done fixing');
