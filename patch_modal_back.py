import re

for filepath in ['src/pages/TeacherNewsletters.tsx', 'src/pages/PrincipalNewsletters.tsx']:
    with open(filepath, 'r') as f:
        content = f.read()

    # Import ArrowLeft
    if 'ArrowLeft' not in content:
        content = content.replace('lucide-react";', 'ArrowLeft, lucide-react";')
        content = content.replace('ArrowLeft, lucide-react";', 'ArrowLeft } from "lucide-react";')

    if filepath == 'src/pages/TeacherNewsletters.tsx':
        old_header = """                <div className="flex items-center justify-between p-4 border-b border-outline-variant/20 bg-surface-container-low">
                   <h2 className="text-lg font-display font-bold text-on-surface">{showPdfModal.title}</h2>
                   <button onClick={() => {
                          const w = window.open();"""
        
        new_header = """                <div className="flex items-center justify-between p-4 border-b border-outline-variant/20 bg-surface-container-low">
                   <div className="flex items-center gap-3">
                       <button onClick={() => setShowPdfModal(null)} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-surface-variant text-on-surface-variant" title="Back to previous page">
                           <ArrowLeft className="w-5 h-5" />
                       </button>
                       <h2 className="text-lg font-display font-bold text-on-surface line-clamp-1">{showPdfModal.title}</h2>
                   </div>
                   <div className="flex items-center gap-2">
                       <button onClick={() => {
                          const w = window.open();"""
        
        content = content.replace(old_header, new_header)

        old_close = """                       </button>
                   <button onClick={() => setShowPdfModal(null)} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-surface-variant text-on-surface-variant">
                      <X className="w-5 h-5" />
                   </button>
                </div>"""
        
        new_close = """                       </button>
                   </div>
                </div>"""

        content = content.replace(old_close, new_close)

    elif filepath == 'src/pages/PrincipalNewsletters.tsx':
        old_header = """                <div className="flex items-center justify-between p-4 border-b border-outline-variant/20 bg-surface-container-low">
                   <h2 className="text-lg font-display font-bold text-on-surface flex items-center gap-2">
                       {showPdfModal.title}
                       {showPdfModal.status === "Approved" && <CheckCircle2 className="w-4 h-4 text-tertiary" />}
                   </h2>
                   <div className="flex items-center gap-2">"""
        
        new_header = """                <div className="flex items-center justify-between p-4 border-b border-outline-variant/20 bg-surface-container-low">
                   <div className="flex items-center gap-3">
                       <button onClick={() => setShowPdfModal(null)} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-surface-variant text-on-surface-variant" title="Back to previous page">
                           <ArrowLeft className="w-5 h-5" />
                       </button>
                       <h2 className="text-lg font-display font-bold text-on-surface flex items-center gap-2 line-clamp-1">
                           {showPdfModal.title}
                           {showPdfModal.status === "Approved" && <CheckCircle2 className="w-4 h-4 text-tertiary" />}
                       </h2>
                   </div>
                   <div className="flex items-center gap-2">"""
                   
        content = content.replace(old_header, new_header)
        
        old_close = """                       </button>
                       <button onClick={() => setShowPdfModal(null)} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-surface-variant text-on-surface-variant ml-2">
                          <X className="w-5 h-5" />
                       </button>
                   </div>
                </div>"""
        
        new_close = """                       </button>
                   </div>
                </div>"""
        
        content = content.replace(old_close, new_close)
        
    with open(filepath, 'w') as f:
        f.write(content)

print("Modal back buttons patched.")
