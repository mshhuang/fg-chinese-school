import re

filepath = 'src/pages/PrincipalNewsletters.tsx'
with open(filepath, 'r') as f:
    content = f.read()

old_att = """                                     <a key={i} href={att.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-surface-container hover:bg-surface-variant transition-colors py-1.5 px-3 rounded-lg max-w-full overflow-hidden">
                                         <FileText className="w-4 h-4 text-primary shrink-0" />
                                         <span className="text-xs font-mono truncate text-primary hover:underline">{att.name}</span>
                                     </a>"""

new_att = """                                     <button type="button" key={i} onClick={(e) => { e.stopPropagation(); openViewer(news, att.url); }} className="flex items-center gap-2 bg-surface-container hover:bg-surface-variant transition-colors py-1.5 px-3 rounded-lg max-w-full overflow-hidden">
                                         <FileText className="w-4 h-4 text-primary shrink-0" />
                                         <span className="text-xs font-mono truncate text-primary hover:underline">{att.name}</span>
                                     </button>"""

content = content.replace(old_att, new_att)

# Also fix the main pdf link in PrincipalNewsletters if I missed it
old_pdf = """                             <a href={news.pdfData} target="_blank" rel="noreferrer" className="flex items-center gap-2 mb-2 bg-surface-container hover:bg-surface-variant transition-colors py-1.5 px-3 rounded-lg w-max max-w-full overflow-hidden">
                                 <FileText className="w-4 h-4 text-primary shrink-0" />
                                 <span className="text-xs font-mono truncate text-primary hover:underline">{news.pdfName}</span>
                             </a>"""

new_pdf = """                             <button onClick={(e) => { e.stopPropagation(); openViewer(news, news.pdfData); }} className="flex items-center gap-2 mb-2 bg-surface-container hover:bg-surface-variant transition-colors py-1.5 px-3 rounded-lg w-max max-w-full overflow-hidden">
                                 <FileText className="w-4 h-4 text-primary shrink-0" />
                                 <span className="text-xs font-mono truncate text-primary hover:underline">{news.pdfName}</span>
                             </button>"""

content = content.replace(old_pdf, new_pdf)

with open(filepath, 'w') as f:
    f.write(content)

