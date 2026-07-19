with open('src/pages/Announcements.tsx', 'r') as f:
    content = f.read()

import_statement = """import MagicUrl from 'quill-magic-url';
import katex from 'katex';
import 'katex/dist/katex.min.css';
window.katex = katex;"""

content = content.replace("import MagicUrl from 'quill-magic-url';", import_statement)

with open('src/pages/Announcements.tsx', 'w') as f:
    f.write(content)
