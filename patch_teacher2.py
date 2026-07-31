import re

with open('src/pages/TeacherNewsletters.tsx', 'r') as f:
    content = f.read()

if 'const [activeViewerUrl, setActiveViewerUrl] = useState<string | null>(null);' not in content:
    content = content.replace(
        'const [showPdfModal, setShowPdfModal] = useState<any>(null);',
        'const [showPdfModal, setShowPdfModal] = useState<any>(null);\n  const [activeViewerUrl, setActiveViewerUrl] = useState<string | null>(null);\n\n  useEffect(() => {\n    setActiveViewerUrl(showPdfModal?.pdfData || (showPdfModal?.attachments?.[0]?.url) || null);\n  }, [showPdfModal]);'
    )

old_iframe = """                    {showPdfModal.pdfData ? (
                        <iframe src={showPdfModal.pdfData} className="flex-1 w-full min-h-[400px] rounded-xl border border-outline-variant/20" title="PDF Viewer" />
                    ) : (
                        <div className="flex-1 p-6 bg-surface-container-low rounded-xl border border-outline-variant/20 overflow-y-auto whitespace-pre-wrap font-body text-on-surface">
                            {showPdfModal.content || "No content available."}
                        </div>
                    )}"""

new_iframe = """                    {activeViewerUrl ? (
                        <iframe src={activeViewerUrl} className="flex-1 w-full min-h-[400px] rounded-xl border border-outline-variant/20" title="Document Viewer" />
                    ) : (
                        <div className="flex-1 p-6 bg-surface-container-low rounded-xl border border-outline-variant/20 overflow-y-auto whitespace-pre-wrap font-body text-on-surface">
                            {showPdfModal.content || "No content available."}
                        </div>
                    )}"""

content = content.replace(old_iframe, new_iframe)

old_attachments = """                    {showPdfModal.attachments && showPdfModal.attachments.length > 0 && (
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
                    )}"""

new_attachments = """                    {(showPdfModal.attachments?.length > 0 || showPdfModal.pdfData) && (
                        <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20 shrink-0">
                            <label className="block text-xs font-label font-bold text-on-surface-variant mb-2">Attached Files</label>
                            <div className="flex flex-wrap gap-2">
                                {showPdfModal.pdfData && (
                                    <button onClick={() => setActiveViewerUrl(showPdfModal.pdfData)} className={`flex items-center gap-2 py-2 px-3 rounded-lg border transition-colors ${activeViewerUrl === showPdfModal.pdfData ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container hover:bg-surface-variant border-outline-variant/30 text-primary'}`}>
                                        <FileText className={`w-4 h-4 shrink-0 ${activeViewerUrl === showPdfModal.pdfData ? 'text-on-primary' : 'text-primary'}`} />
                                        <span className="text-sm font-medium hover:underline">{showPdfModal.pdfName || 'Main Document'}</span>
                                    </button>
                                )}
                                {showPdfModal.attachments?.map((att: any, i: number) => (
                                    <button key={i} onClick={() => setActiveViewerUrl(att.url)} className={`flex items-center gap-2 py-2 px-3 rounded-lg border transition-colors ${activeViewerUrl === att.url ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container hover:bg-surface-variant border-outline-variant/30 text-primary'}`}>
                                        <FileText className={`w-4 h-4 shrink-0 ${activeViewerUrl === att.url ? 'text-on-primary' : 'text-primary'}`} />
                                        <span className="text-sm font-medium hover:underline">{att.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}"""

content = content.replace(old_attachments, new_attachments)

with open('src/pages/TeacherNewsletters.tsx', 'w') as f:
    f.write(content)
print("TeacherNewsletters attachments patched.")
