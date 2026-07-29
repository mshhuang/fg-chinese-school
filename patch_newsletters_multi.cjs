const fs = require('fs');
let code = fs.readFileSync('src/pages/TeacherNewsletters.tsx', 'utf8');

// Replace states
code = code.replace(
    `  const [pdfFile, setPdfFile] = useState<string | null>(null);\n  const [pdfFileObj, setPdfFileObj] = useState<File | null>(null);\n  const [pdfName, setPdfName] = useState("");`,
    `  const [pdfFile, setPdfFile] = useState<string | null>(null);\n  const [pdfFileObj, setPdfFileObj] = useState<File | null>(null);\n  const [pdfName, setPdfName] = useState("");\n  const [attachments, setAttachments] = useState<{name: string, url: string | null, fileObj: File | null}[]>([]);\n  const [isUploading, setIsUploading] = useState(false);`
);

// Replace handleEditInit
code = code.replace(
    `     setPdfName(news.pdfName || "");\n     setPdfFile(news.pdfData || null);\n     setPdfFileObj(null);`,
    `     setPdfName(news.pdfName || "");\n     setPdfFile(news.pdfData || null);\n     setPdfFileObj(null);\n     setAttachments(news.attachments || []);`
);

// Replace handleFileChange
const handleFileChangeTarget = `  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setPdfName(file.name);
        if (file.size > 2 * 1024 * 1024) {
           alert("File is too large for this prototype. Please keep it under 2MB.");
           return;
        }
        setPdfFileObj(file); // Save File object for storage upload
        const reader = new FileReader();
        reader.onloadend = () => {
           setPdfFile(reader.result as string); // Keep base64 for fallback/local storage
        };
        reader.readAsDataURL(file);
     }
  };`;

const handleFileChangeReplace = `  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files && e.target.files.length > 0) {
        const newFiles = Array.from(e.target.files);
        const newAttachments = [...attachments];
        let hasError = false;

        for (const file of newFiles) {
            if (file.size > 10 * 1024 * 1024) {
               alert(\`File \${file.name} is too large. Please keep it under 10MB.\`);
               hasError = true;
               continue;
            }
            newAttachments.push({
                name: file.name,
                url: null,
                fileObj: file
            });
        }
        setAttachments(newAttachments);
     }
  };
  
  const removeAttachment = (index: number) => {
      setAttachments(prev => prev.filter((_, i) => i !== index));
  };`;

code = code.replace(handleFileChangeTarget, handleFileChangeReplace);

// Update save logic
const handleSaveTarget = `     if (!title.trim()) return alert("Title is required");
     
     let finalPdfData = pdfFile;
     
     if (pdfFileObj) {
        const filePath = \`\${Date.now()}_\${pdfFileObj.name.replace(/[^a-zA-Z0-9.\\-_]/g, '')}\`;
        const { error: uploadError } = await supabase.storage
            .from('newsletter_pdfs')
            .upload(filePath, pdfFileObj, { cacheControl: '3600', upsert: false });
            
        if (!uploadError) {
            const { data } = supabase.storage.from('newsletter_pdfs').getPublicUrl(filePath);
            finalPdfData = data.publicUrl;
        } else {
            console.error("Storage upload failed:", uploadError);
            if (uploadError.statusCode === "404") { 
                alert("Could not upload PDF: Bucket 'newsletter_pdfs' not found. Ensure it exists and is public.");
            } else if (uploadError.message.includes("policy") || uploadError.statusCode === "403") { 
                alert("Could not upload PDF: Upload blocked by storage Row-Level Security policy.");
            }
        }
     }`;

const handleSaveReplace = `     if (!title.trim()) return alert("Title is required");
     
     setIsUploading(true);
     let finalPdfData = pdfFile;
     
     // Backward compatibility for old pdf upload
     if (pdfFileObj) {
        const filePath = \`\${Date.now()}_\${pdfFileObj.name.replace(/[^a-zA-Z0-9.\\-_]/g, '')}\`;
        const { error: uploadError } = await supabase.storage
            .from('newsletter_pdfs')
            .upload(filePath, pdfFileObj, { cacheControl: '3600', upsert: false });
            
        if (!uploadError) {
            const { data } = supabase.storage.from('newsletter_pdfs').getPublicUrl(filePath);
            finalPdfData = data.publicUrl;
        } else {
            console.error("Storage upload failed:", uploadError);
            alert("Could not upload PDF: " + uploadError.message);
        }
     }
     
     // New attachments logic
     const finalAttachments = [...attachments];
     for (let i = 0; i < finalAttachments.length; i++) {
         const att = finalAttachments[i];
         if (att.fileObj) {
             const filePath = \`\${Date.now()}_\${att.fileObj.name.replace(/[^a-zA-Z0-9.\\-_]/g, '')}\`;
             const { error: uploadError } = await supabase.storage
                .from('newsletter_pdfs')
                .upload(filePath, att.fileObj, { cacheControl: '3600', upsert: false });
             
             if (!uploadError) {
                 const { data } = supabase.storage.from('newsletter_pdfs').getPublicUrl(filePath);
                 finalAttachments[i] = { name: att.name, url: data.publicUrl, fileObj: null };
             } else {
                 console.error("Attachment upload failed:", uploadError);
                 alert("Could not upload attachment " + att.name + ": " + uploadError.message);
             }
         }
     }`;

code = code.replace(handleSaveTarget, handleSaveReplace);

const payloadPropsTarget = `     const payloadProps = {
        content,
        audience,
        status,
        date: new Date().toLocaleDateString('en-US', { timeZone: 'America/New_York' }),
        author: authorName, 
        pdfData: finalPdfData,
        pdfName,
        adminComment: null
     };`;

const payloadPropsReplace = `     const payloadProps = {
        content,
        audience,
        status,
        date: new Date().toLocaleDateString('en-US', { timeZone: 'America/New_York' }),
        author: authorName, 
        pdfData: finalPdfData,
        pdfName,
        attachments: finalAttachments,
        adminComment: null
     };`;

code = code.replace(payloadPropsTarget, payloadPropsReplace);

code = code.replace(
    `alert("Newsletter successfully updated!");`,
    `alert("Newsletter successfully updated!"); setIsUploading(false);`
);

code = code.replace(
    `alert("Newsletter successfully saved!");`,
    `alert("Newsletter successfully saved!"); setIsUploading(false);`
);

code = code.replace(
    `        <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-surface-variant text-on-surface-variant">`,
    `        <button onClick={() => setShowModal(false)} disabled={isUploading} className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-surface-variant text-on-surface-variant">`
);

const uploadUItarget = `                    <div>
                       <label className="block text-sm font-label font-bold text-on-surface mb-2">Upload PDF Newsletter</label>
                       <input 
                           type="file" 
                           accept="application/pdf"
                           ref={fileInputRef}
                           className="hidden"
                           onChange={handleFileChange}
                       />
                       <div 
                           onClick={() => fileInputRef.current?.click()}
                           className="w-full border-2 border-dashed border-outline-variant/50 hover:border-primary/50 bg-surface-container-low hover:bg-primary/5 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors"
                       >
                           <FileText className="w-8 h-8 text-on-surface-variant mb-2" />
                           {pdfName ? (
                              <p className="text-sm font-bold text-primary">{pdfName}</p>
                           ) : (
                              <>
                                <p className="text-sm font-bold text-on-surface">Click to attach PDF</p>
                                <p className="text-xs text-on-surface-variant mt-1">Max file size: 2MB</p>
                              </>
                           )}
                       </div>
                    </div>`;

const uploadUIreplace = `                    <div>
                       <label className="block text-sm font-label font-bold text-on-surface mb-2">Attachments</label>
                       <input 
                           type="file" 
                           multiple
                           accept=".pdf,.doc,.docx,.txt,image/*,.heic"
                           ref={fileInputRef}
                           className="hidden"
                           onChange={handleFileChange}
                       />
                       <div 
                           onClick={() => fileInputRef.current?.click()}
                           className="w-full border-2 border-dashed border-outline-variant/50 hover:border-primary/50 bg-surface-container-low hover:bg-primary/5 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors mb-4"
                       >
                           <FileText className="w-8 h-8 text-on-surface-variant mb-2" />
                           <p className="text-sm font-bold text-on-surface">Click to attach files</p>
                           <p className="text-xs text-on-surface-variant mt-1">Supported: PDF, Word, Text, Images, HEIC (Max 10MB each)</p>
                       </div>
                       
                       {(pdfName || attachments.length > 0) && (
                           <div className="flex flex-col gap-2">
                               {pdfName && (
                                   <div className="flex items-center justify-between bg-surface-container px-4 py-2 rounded-xl border border-outline-variant/30">
                                      <div className="flex items-center gap-2 overflow-hidden">
                                          <FileText className="w-4 h-4 text-primary shrink-0" />
                                          <span className="text-sm font-medium truncate">{pdfName}</span>
                                      </div>
                                      <button onClick={() => { setPdfName(""); setPdfFile(null); setPdfFileObj(null); }} className="text-error hover:text-error/80 shrink-0 p-1">
                                          <X className="w-4 h-4" />
                                      </button>
                                   </div>
                               )}
                               {attachments.map((att, i) => (
                                   <div key={i} className="flex items-center justify-between bg-surface-container px-4 py-2 rounded-xl border border-outline-variant/30">
                                      <div className="flex items-center gap-2 overflow-hidden">
                                          <FileText className="w-4 h-4 text-primary shrink-0" />
                                          <span className="text-sm font-medium truncate">{att.name}</span>
                                      </div>
                                      <button onClick={() => removeAttachment(i)} className="text-error hover:text-error/80 shrink-0 p-1">
                                          <X className="w-4 h-4" />
                                      </button>
                                   </div>
                               ))}
                           </div>
                       )}
                    </div>`;

code = code.replace(uploadUItarget, uploadUIreplace);

const buttonsTarget = `                   <button onClick={() => handleSave("Draft")} className="flex-1 bg-surface-container hover:bg-surface-variant text-on-surface font-bold py-3 px-6 rounded-full transition-colors text-sm">
                      Save as Draft
                   </button>
                   <button onClick={() => handleSave("Pending Approval")} className="flex-[2] bg-primary hover:bg-primary/90 text-on-primary font-bold py-3 px-6 rounded-full transition-colors text-sm flex items-center justify-center gap-2">
                       <Send className="w-4 h-4" />
                       Submit for Approval
                   </button>`;

const buttonsReplace = `                   <button disabled={isUploading} onClick={() => handleSave("Draft")} className="flex-1 bg-surface-container hover:bg-surface-variant text-on-surface font-bold py-3 px-6 rounded-full transition-colors text-sm disabled:opacity-50">
                      {isUploading ? 'Saving...' : 'Save as Draft'}
                   </button>
                   <button disabled={isUploading} onClick={() => handleSave("Pending Approval")} className="flex-[2] bg-primary hover:bg-primary/90 text-on-primary font-bold py-3 px-6 rounded-full transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                       <Send className="w-4 h-4" />
                       {isUploading ? 'Saving...' : 'Submit for Approval'}
                   </button>`;

code = code.replace(buttonsTarget, buttonsReplace);

const displayAttachmentsTarget = `                 {news.pdfName && (
                     <div className="flex items-center gap-2 mb-4 bg-surface-container py-1.5 px-3 rounded-lg w-max max-w-full overflow-hidden">
                         <FileText className="w-4 h-4 text-primary shrink-0" />
                         <span className="text-xs font-mono truncate">{news.pdfName}</span>
                     </div>
                 )}`;

const displayAttachmentsReplace = `                 {news.pdfName && (
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

code = code.replace(displayAttachmentsTarget, displayAttachmentsReplace);

fs.writeFileSync('src/pages/TeacherNewsletters.tsx', code);
console.log('patched');
