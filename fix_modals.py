import re

# Update PrincipalNewsletters.tsx
with open('src/pages/PrincipalNewsletters.tsx', 'r') as f:
    p_content = f.read()

p_bad = """                        <div className="flex-1 p-6 bg-surface-container-low rounded-xl border border-outline-variant/20 overflow-y-auto whitespace-pre-wrap font-body text-on-surface">
                            {showPdfModal.content || "No content available."}
                        </div>
                    )}
                    <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20 shrink-0">
                       <label className="block text-xs font-label font-bold text-on-surface-variant mb-1">Admin Notes / Description</label>"""

p_good = """                        <div className="flex-1 p-6 bg-surface-container-low rounded-xl border border-outline-variant/20 overflow-y-auto whitespace-pre-wrap font-body text-on-surface">
                            {showPdfModal.content || "No content available."}
                        </div>
                    )}
                    {showPdfModal.attachments && showPdfModal.attachments.length > 0 && (
                        <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20 shrink-0">
                            <label className="block text-xs font-label font-bold text-on-surface-variant mb-2">Attached Files</label>
                            <div className="flex flex-wrap gap-2">
                                {showPdfModal.attachments.map((att: any, i: number) => (
                                    <a key={i} href={att.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-surface-container hover:bg-surface-variant transition-colors py-2 px-3 rounded-lg border border-outline-variant/30">
                                        <FileText className="w-4 h-4 text-primary shrink-0" />
                                        <span className="text-sm font-medium text-primary hover:underline">{att.name}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20 shrink-0">
                       <label className="block text-xs font-label font-bold text-on-surface-variant mb-1">Admin Notes / Description</label>"""

if p_bad in p_content:
    p_content = p_content.replace(p_bad, p_good)
    with open('src/pages/PrincipalNewsletters.tsx', 'w') as f:
        f.write(p_content)
    print("Patched PrincipalNewsletters.tsx")
else:
    print("Could not find block in PrincipalNewsletters.tsx")

# Update TeacherNewsletters.tsx
with open('src/pages/TeacherNewsletters.tsx', 'r') as f:
    t_content = f.read()

t_bad = """                <div className="flex-1 bg-surface-container-lowest p-2 overflow-y-auto">
                    {showPdfModal.pdfData ? (
                        <iframe src={showPdfModal.pdfData} className="w-full h-full min-h-[400px] rounded-xl border border-outline-variant/20" title="PDF Viewer" />
                    ) : (
                        <div className="p-6 h-full bg-surface-container-low rounded-xl border border-outline-variant/20 overflow-y-auto whitespace-pre-wrap font-body text-on-surface">
                            {showPdfModal.content || "No content available."}
                        </div>
                    )}
                </div>"""

t_good = """                <div className="flex-1 bg-surface-container-lowest p-2 overflow-y-auto flex flex-col gap-2">
                    {showPdfModal.pdfData ? (
                        <iframe src={showPdfModal.pdfData} className="flex-1 w-full min-h-[400px] rounded-xl border border-outline-variant/20" title="PDF Viewer" />
                    ) : (
                        <div className="flex-1 p-6 bg-surface-container-low rounded-xl border border-outline-variant/20 overflow-y-auto whitespace-pre-wrap font-body text-on-surface">
                            {showPdfModal.content || "No content available."}
                        </div>
                    )}
                    {showPdfModal.attachments && showPdfModal.attachments.length > 0 && (
                        <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20 shrink-0">
                            <label className="block text-xs font-label font-bold text-on-surface-variant mb-2">Attached Files</label>
                            <div className="flex flex-wrap gap-2">
                                {showPdfModal.attachments.map((att: any, i: number) => (
                                    <a key={i} href={att.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-surface-container hover:bg-surface-variant transition-colors py-2 px-3 rounded-lg border border-outline-variant/30">
                                        <FileText className="w-4 h-4 text-primary shrink-0" />
                                        <span className="text-sm font-medium text-primary hover:underline">{att.name}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>"""

if t_bad in t_content:
    t_content = t_content.replace(t_bad, t_good)
    with open('src/pages/TeacherNewsletters.tsx', 'w') as f:
        f.write(t_content)
    print("Patched TeacherNewsletters.tsx")
else:
    print("Could not find block in TeacherNewsletters.tsx")

