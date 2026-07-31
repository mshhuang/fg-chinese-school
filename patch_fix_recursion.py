import re

for filepath in ['src/pages/TeacherNewsletters.tsx', 'src/pages/PrincipalNewsletters.tsx']:
    with open(filepath, 'r') as f:
        content = f.read()

    # Fix the recursion bug
    bad_code = """  const openViewer = (news: any, targetUrl?: string) => {
      openViewer(news);"""
    
    good_code = """  const openViewer = (news: any, targetUrl?: string) => {
      setShowPdfModal(news);"""
      
    content = content.replace(bad_code, good_code)

    # Also update the pdfLink to include targetUrl
    old_pdfLink = """<button onClick={(e) => { e.stopPropagation(); openViewer(news); }} className="flex items-center gap-2 mb-2 bg-surface-container hover:bg-surface-variant transition-colors py-1.5 px-3 rounded-lg w-max max-w-full overflow-hidden">"""
    new_pdfLink = """<button onClick={(e) => { e.stopPropagation(); openViewer(news, news.pdfData); }} className="flex items-center gap-2 mb-2 bg-surface-container hover:bg-surface-variant transition-colors py-1.5 px-3 rounded-lg w-max max-w-full overflow-hidden">"""
    content = content.replace(old_pdfLink, new_pdfLink)

    with open(filepath, 'w') as f:
        f.write(content)

