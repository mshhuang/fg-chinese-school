import re

with open('src/pages/Announcements.tsx', 'r') as f:
    content = f.read()

useEffect_titles = """  // Add tooltips to Quill toolbar buttons
  useEffect(() => {
    const addTitles = () => {
      const toolbar = document.querySelector('.ql-toolbar');
      if (!toolbar) return;
      
      const titles: Record<string, string> = {
        'ql-bold': 'Bold',
        'ql-italic': 'Italic',
        'ql-underline': 'Underline',
        'ql-strike': 'Strikethrough',
        'ql-blockquote': 'Blockquote',
        'ql-list[value="ordered"]': 'Numbered List',
        'ql-list[value="bullet"]': 'Bulleted List',
        'ql-script[value="sub"]': 'Subscript',
        'ql-script[value="super"]': 'Superscript',
        'ql-indent[value="-1"]': 'Decrease Indent',
        'ql-indent[value="+1"]': 'Increase Indent',
        'ql-direction': 'Text Direction',
        'ql-header': 'Heading',
        'ql-align': 'Alignment',
        'ql-link': 'Insert Link',
        'ql-image': 'Insert Image',
        'ql-video': 'Insert Video',
        'ql-formula': 'Insert Formula',
        'ql-table': 'Insert Table',
        'ql-clean': 'Clear Formatting',
        'ql-font': 'Font',
        'ql-size': 'Size',
        'ql-color': 'Text Color',
        'ql-background': 'Background Color'
      };

      for (const [selector, title] of Object.entries(titles)) {
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
      }
    };
    
    // Run after a short delay to ensure Quill is mounted
    setTimeout(addTitles, 500);
    setTimeout(addTitles, 2000);
  }, [showCompose, announcements]);
"""

target = "const [selectedPostingRole, setSelectedPostingRole] = useState<string>(\"\");"
content = content.replace(target, target + "\n\n" + useEffect_titles)

with open('src/pages/Announcements.tsx', 'w') as f:
    f.write(content)

