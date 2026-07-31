import re

with open('src/pages/PrincipalNewsletters.tsx', 'r') as f:
    p_content = f.read()

# Fix the modal delete button in PrincipalNewsletters.tsx
p_bad = """<button onClick={() => { handleDelete(showPdfModal.id); setShowPdfModal(null); }} className="bg-error/10 text-error hover:bg-error/20 font-bold py-1.5 px-4 rounded-full transition-colors text-sm flex items-center gap-2">
                          <Trash2 className="w-4 h-4" /> Delete
                       </button>"""
p_good = """<button onClick={() => { handleDelete(showPdfModal.id, true); setShowPdfModal(null); }} className="bg-error/10 text-error hover:bg-error/20 font-bold py-1.5 px-4 rounded-full transition-colors text-sm flex items-center gap-2">
                          <Trash2 className="w-4 h-4" /> Delete
                       </button>"""
if p_bad in p_content:
    p_content = p_content.replace(p_bad, p_good)
    print("Fixed modal delete button in PrincipalNewsletters.tsx")

with open('src/pages/PrincipalNewsletters.tsx', 'w') as f:
    f.write(p_content)

