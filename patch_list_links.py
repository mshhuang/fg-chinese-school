import re

for filepath in ['src/pages/TeacherNewsletters.tsx', 'src/pages/PrincipalNewsletters.tsx']:
    with open(filepath, 'r') as f:
        content = f.read()

    # Find the pdfName rendering block
    old_pdf_link = """                 {news.pdfName && (
                     <a href={news.pdfData} target="_blank" rel="noreferrer" className="flex items-center gap-2 mb-2 bg-surface-container hover:bg-surface-variant transition-colors py-1.5 px-3 rounded-lg w-max max-w-full overflow-hidden">
                         <FileText className="w-4 h-4 text-primary shrink-0" />
                         <span className="text-xs font-mono truncate text-primary hover:underline">{news.pdfName}</span>
                     </a>
                 )}"""

    new_pdf_link = """                 {news.pdfName && (
                     <button onClick={(e) => { e.stopPropagation(); setShowPdfModal(news); }} className="flex items-center gap-2 mb-2 bg-surface-container hover:bg-surface-variant transition-colors py-1.5 px-3 rounded-lg w-max max-w-full overflow-hidden">
                         <FileText className="w-4 h-4 text-primary shrink-0" />
                         <span className="text-xs font-mono truncate text-primary hover:underline">{news.pdfName}</span>
                     </button>
                 )}"""

    # For PrincipalNewsletters, it might be slightly different or exactly the same
    # Let's check PrincipalNewsletters manually
    
    content = content.replace(old_pdf_link, new_pdf_link)

    old_att_link = """                             <a key={i} href={att.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-surface-container hover:bg-surface-variant transition-colors py-1.5 px-3 rounded-lg max-w-full overflow-hidden">
                                 <FileText className="w-4 h-4 text-primary shrink-0" />
                                 <span className="text-xs font-mono truncate text-primary hover:underline">{att.name}</span>
                             </a>"""

    new_att_link = """                             <button type="button" key={i} onClick={(e) => { e.stopPropagation(); setShowPdfModal(news); }} className="flex items-center gap-2 bg-surface-container hover:bg-surface-variant transition-colors py-1.5 px-3 rounded-lg max-w-full overflow-hidden">
                                 <FileText className="w-4 h-4 text-primary shrink-0" />
                                 <span className="text-xs font-mono truncate text-primary hover:underline">{att.name}</span>
                             </button>"""

    content = content.replace(old_att_link, new_att_link)

    with open(filepath, 'w') as f:
        f.write(content)
    
    print(f"Patched links in {filepath}")

