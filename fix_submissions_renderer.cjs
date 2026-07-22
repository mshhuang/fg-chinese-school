const fs = require('fs');
let content = fs.readFileSync('src/pages/TeacherAssignmentBoard.tsx', 'utf8');

const replacement = `
                                         return (
                                             <div className="flex flex-col gap-2 pt-3 mt-1 border-t border-outline-variant/20">
                                                 <div className="flex justify-between items-center">
                                                     <span className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider">Student Submission</span>
                                                     {(cleanRawText || subAtts.length > 0) && (
                                                         <button 
                                                             onClick={() => setViewingSubmission({ studentName: student ? \`\${student.first_name} \${student.last_name}\` : 'Unknown Student', text: rawText, attachments: subAtts, assignmentTitle: a.title })}
                                                             className="px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition-colors flex items-center gap-1.5"
                                                         >
                                                             <Search className="w-3.5 h-3.5" />
                                                             Full View
                                                         </button>
                                                     )}
                                                 </div>
                                                 {cleanRawText && (
                                                     <div className="tiptap-editor prose prose-sm sm:prose-base max-w-none font-body text-sm text-on-surface bg-surface p-2 rounded border border-outline-variant/30 px-3 py-2 min-h-[50px] break-normal" dangerouslySetInnerHTML={{ __html: rawText }} />
                                                 )}
                                                 {!cleanRawText && subAtts.length === 0 && (
                                                     <div className="font-body text-sm text-on-surface-variant italic bg-surface p-2 rounded border border-outline-variant/30 px-3 py-2">
                                                         Blank submission (no text or attachments provided).
                                                     </div>
                                                 )}
                                                 {subAtts.length > 0 && (
                                                     <div className="flex flex-wrap gap-2">
                                                         {subAtts.map((att: any, i: number) => {
                                                             const isImage = att.url?.startsWith('data:image/') || att.name?.match(/\\.(jpeg|jpg|gif|png)$/i);
                                                             return (
                                                                 <div key={i} className="relative group">
                                                                     {isImage ? (
                                                                         <div onClick={() => setFullscreenImage(att.url)} className="cursor-pointer border border-outline-variant/30 rounded-lg overflow-hidden relative">
                                                                            <img src={att.url} alt={att.name} className="h-20 w-auto object-cover" />
                                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                                <Search className="w-5 h-5 text-white" />
                                                                            </div>
                                                                         </div>
                                                                     ) : (
                                                                         <a href={att.url} download={att.name} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-primary-container/30 px-3 py-1.5 rounded-lg border border-primary/20 text-xs font-label hover:bg-primary-container/50 transition-colors text-primary shadow-sm">
                                                                             <FileText className="w-4 h-4" />
                                                                             <span className="truncate max-w-[200px]" title={att.name}>{att.name}</span>
                                                                         </a>
                                                                     )}
                                                                 </div>
                                                             );
                                                         })}
                                                     </div>
                                                 )}
                                             </div>
                                         );
`;

const matchStr = `                                         return (
                                             <div className="flex flex-col gap-2 pt-3 mt-1 border-t border-outline-variant/20">
                                                 <span className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider">Student Submission</span>
                                                 {cleanRawText && (
                                                     <div className="tiptap-editor prose prose-sm sm:prose-base max-w-none font-body text-sm text-on-surface bg-surface p-2 rounded border border-outline-variant/30 px-3 py-2 min-h-[50px] break-normal" dangerouslySetInnerHTML={{ __html: rawText }} />
                                                 )}
                                                 {!cleanRawText && subAtts.length === 0 && (
                                                     <div className="font-body text-sm text-on-surface-variant italic bg-surface p-2 rounded border border-outline-variant/30 px-3 py-2">
                                                         Blank submission (no text or attachments provided).
                                                     </div>
                                                 )}
                                                 {subAtts.length > 0 && (
                                                     <div className="flex flex-wrap gap-2">
                                                         {subAtts.map((att: any, i: number) => (
                                                             <a key={i} href={att.url} download={att.name} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-primary-container/30 px-3 py-1.5 rounded-lg border border-primary/20 text-xs font-label hover:bg-primary-container/50 transition-colors text-primary shadow-sm">
                                                                 <FileText className="w-4 h-4" />
                                                                 <span className="truncate max-w-[200px]" title={att.name}>{att.name}</span>
                                                             </a>
                                                         ))}
                                                     </div>
                                                 )}
                                             </div>
                                         );`;

content = content.replace(matchStr, replacement.trim());

fs.writeFileSync('src/pages/TeacherAssignmentBoard.tsx', content);
