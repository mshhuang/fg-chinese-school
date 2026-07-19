import re

with open('src/pages/Announcements.tsx', 'r') as f:
    content = f.read()

content = content.replace("const toolbar = document.querySelector('.ql-toolbar');", "const toolbars = document.querySelectorAll('.ql-toolbar');")
content = content.replace("if (!toolbar) return;", "if (!toolbars.length) return;\n      toolbars.forEach(toolbar => {")

replace_loop = """      for (const [selector, title] of Object.entries(titles)) {
        let el;
        if (selector.includes('[')) {
          // Complex selector like ql-list[value="ordered"]
          const cls = selector.split('[')[0];
          const val = selector.split('"')[1];
          el = toolbar.querySelector(`button.${cls}[value="${val}"]`);
        } else if (selector === 'ql-header' || selector === 'ql-font' || selector === 'ql-size' || selector === 'ql-align' || selector === 'ql-color' || selector === 'ql-background') {
          el = toolbar.querySelector(`span.${selector}`);
        } else {
          el = toolbar.querySelector(`button.${selector}`);
        }
        
        if (el) {
          el.setAttribute('title', title);
        }
      }"""

with_closing = replace_loop + "\n      });"
content = content.replace(replace_loop, with_closing)

with open('src/pages/Announcements.tsx', 'w') as f:
    f.write(content)
