import re

for filepath in ['src/pages/TeacherNewsletters.tsx', 'src/pages/PrincipalNewsletters.tsx']:
    with open(filepath, 'r') as f:
        content = f.read()

    # Find openViewer(news) in the attachment loop
    # We can just replace openViewer(news) with openViewer(news, att.url) if it's inside the att.name block
    # Actually, simpler: 
    old_btn = """<button type="button" key={i} onClick={(e) => { e.stopPropagation(); openViewer(news); }}"""
    new_btn = """<button type="button" key={i} onClick={(e) => { e.stopPropagation(); openViewer(news, att.url); }}"""
    
    content = content.replace(old_btn, new_btn)

    with open(filepath, 'w') as f:
        f.write(content)

