const fs = require('fs');
let code = fs.readFileSync('src/pages/TeacherNewsletters.tsx', 'utf8');

const displayTarget = `                 {news.pdfName && (
                     <div className="flex items-center gap-2 mb-2 bg-surface-container py-1.5 px-3 rounded-lg w-max max-w-full overflow-hidden">
                         <FileText className="w-4 h-4 text-primary shrink-0" />
                         <span className="text-xs font-mono truncate">{news.pdfName}</span>
                     </div>
                 )}
                 {news.attachments && news.attachments.length > 0 && (
                     <div className="flex flex-wrap gap-2 mb-4">
                         {news.attachments.map((att: any, i: number) => (
                             <div key={i} className="flex items-center gap-2 bg-surface-container py-1.5 px-3 rounded-lg max-w-full overflow-hidden">
                                 <FileText className="w-4 h-4 text-primary shrink-0" />
                                 <span className="text-xs font-mono truncate">{att.name}</span>
                             </div>
                         ))}
                     </div>
                 )}`;

const displayReplace = `                 {news.pdfName && (
                     <a href={news.pdfData} target="_blank" rel="noreferrer" className="flex items-center gap-2 mb-2 bg-surface-container hover:bg-surface-variant transition-colors py-1.5 px-3 rounded-lg w-max max-w-full overflow-hidden">
                         <FileText className="w-4 h-4 text-primary shrink-0" />
                         <span className="text-xs font-mono truncate text-primary hover:underline">{news.pdfName}</span>
                     </a>
                 )}
                 {news.attachments && news.attachments.length > 0 && (
                     <div className="flex flex-wrap gap-2 mb-4">
                         {news.attachments.map((att: any, i: number) => (
                             <a key={i} href={att.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-surface-container hover:bg-surface-variant transition-colors py-1.5 px-3 rounded-lg max-w-full overflow-hidden">
                                 <FileText className="w-4 h-4 text-primary shrink-0" />
                                 <span className="text-xs font-mono truncate text-primary hover:underline">{att.name}</span>
                             </a>
                         ))}
                     </div>
                 )}`;

code = code.replace(displayTarget, displayReplace);

// Also need to make the same changes in other pages that display newsletters! 
// Let's check ParentPortal.tsx and StudentPortal.tsx, PrincipalDashboard.tsx, etc.

fs.writeFileSync('src/pages/TeacherNewsletters.tsx', code);
console.log('patched display');
