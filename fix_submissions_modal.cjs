const fs = require('fs');
let content = fs.readFileSync('src/pages/TeacherAssignmentBoard.tsx', 'utf8');

const modalCode = `
      {viewingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-xl flex flex-col overflow-hidden">
              <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest sticky top-0 z-10">
                 <div>
                     <h2 className="text-2xl font-display font-bold text-on-surface">{viewingSubmission.studentName}'s Submission</h2>
                     <p className="text-sm font-label text-on-surface-variant uppercase tracking-wider font-bold mt-1">{viewingSubmission.assignmentTitle}</p>
                 </div>
                 <button onClick={() => setViewingSubmission(null)} className="p-2 bg-surface hover:bg-surface-variant rounded-full text-on-surface-variant transition-colors">
                    <X className="w-5 h-5" />
                 </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 bg-surface-container-lowest">
                 {viewingSubmission.text && viewingSubmission.text.replace(/<[^>]*>?/gm, '').trim() && (
                     <div className="mb-6">
                         <h3 className="font-label text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-3">Written Response</h3>
                         <div className="tiptap-editor prose prose-sm sm:prose-base max-w-none font-body text-on-surface bg-surface p-4 rounded-xl border border-outline-variant/30 break-normal" dangerouslySetInnerHTML={{ __html: viewingSubmission.text }} />
                     </div>
                 )}
                 {viewingSubmission.attachments && viewingSubmission.attachments.length > 0 && (
                     <div>
                         <h3 className="font-label text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-3">Attachments</h3>
                         <div className="flex flex-col gap-4">
                             {viewingSubmission.attachments.map((att, i) => {
                                 const isImage = att.url?.startsWith('data:image/') || att.name?.match(/\\.(jpeg|jpg|gif|png)$/i);
                                 return (
                                     <div key={i} className="bg-surface border border-outline-variant/30 rounded-xl overflow-hidden">
                                         {isImage ? (
                                             <div className="flex flex-col">
                                                 <div className="px-4 py-3 border-b border-outline-variant/30 flex justify-between items-center bg-surface-variant/30">
                                                     <div className="flex items-center gap-2">
                                                         <Image className="w-4 h-4 text-primary" />
                                                         <span className="font-label text-sm font-bold truncate">{att.name}</span>
                                                     </div>
                                                     <button onClick={() => setFullscreenImage(att.url)} className="text-xs font-label font-bold text-primary hover:underline flex items-center gap-1">
                                                         <Search className="w-3.5 h-3.5" /> Fullscreen
                                                     </button>
                                                 </div>
                                                 <div className="p-4 flex justify-center bg-surface-container-lowest">
                                                     <img src={att.url} alt={att.name} className="max-w-full h-auto max-h-[500px] object-contain rounded-lg shadow-sm border border-outline-variant/20 cursor-pointer" onClick={() => setFullscreenImage(att.url)} />
                                                 </div>
                                             </div>
                                         ) : (
                                             <div className="px-4 py-3 flex justify-between items-center bg-surface-variant/30">
                                                 <div className="flex items-center gap-2">
                                                     <FileText className="w-4 h-4 text-primary" />
                                                     <span className="font-label text-sm font-bold truncate">{att.name}</span>
                                                 </div>
                                                 <a href={att.url} download={att.name} target="_blank" rel="noopener noreferrer" className="text-xs font-label font-bold bg-primary text-on-primary px-3 py-1.5 rounded-full hover:bg-primary/90 transition-colors">
                                                     Download
                                                 </a>
                                             </div>
                                         )}
                                     </div>
                                 );
                             })}
                         </div>
                     </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {fullscreenImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200 backdrop-blur-sm" onClick={() => setFullscreenImage(null)}>
           <button onClick={() => setFullscreenImage(null)} className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-md">
              <X className="w-6 h-6" />
           </button>
           <img src={fullscreenImage} alt="Fullscreen Attachment" className="max-w-full max-h-[90vh] object-contain shadow-2xl rounded-lg" onClick={e => e.stopPropagation()} />
        </div>
      )}
`;

content = content.replace('    </div>\n  );\n}', modalCode + '    </div>\n  );\n}');

// Check if X and Image imports are there, if not, add Image
if (!content.includes('Image, ')) {
    content = content.replace('import { ', 'import { Image, ');
}

fs.writeFileSync('src/pages/TeacherAssignmentBoard.tsx', content);
