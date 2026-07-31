import re

for filepath in ['src/pages/TeacherNewsletters.tsx', 'src/pages/PrincipalNewsletters.tsx']:
    with open(filepath, 'r') as f:
        content = f.read()

    # Find the useEffect setting activeViewerUrl and remove it
    effect_pattern1 = r'  useEffect\(\(\) => \{\n    setActiveViewerUrl\(showPdfModal\?\.pdfData \|\| \(showPdfModal\?\.attachments\?\.\[0\]\?\.url\) \|\| null\);\n  \}, \[showPdfModal\]\);'
    effect_pattern2 = r'  useEffect\(\(\) => \{\n    setActiveViewerUrl\(pdfBlobUrl \|\| \(showPdfModal\?\.attachments\?\.\[0\]\?\.url\) \|\| null\);\n  \}, \[pdfBlobUrl, showPdfModal\]\);'

    content = re.sub(effect_pattern1, '', content)
    content = re.sub(effect_pattern2, '', content)

    # Let's write a helper function
    helper = """
  const openViewer = (news: any, targetUrl?: string) => {
      setShowPdfModal(news);
      setTimeout(() => {
          setActiveViewerUrl(targetUrl || news.pdfData || (news.attachments && news.attachments[0]?.url) || null);
      }, 0);
  };
"""
    if "const openViewer =" not in content:
        content = content.replace("const [activeViewerUrl, setActiveViewerUrl] = useState<string | null>(null);", "const [activeViewerUrl, setActiveViewerUrl] = useState<string | null>(null);\n" + helper)
    
    # Update all setShowPdfModal(news) to openViewer(news) in the list view
    content = content.replace("setShowPdfModal(news)", "openViewer(news)")

    with open(filepath, 'w') as f:
        f.write(content)
        
    print(f"Patched viewer state in {filepath}")

