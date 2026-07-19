import re

with open('src/pages/Announcements.tsx', 'r') as f:
    content = f.read()

target = """    container: [
      [{ 'font': ['sans-serif', 'serif', 'monospace', 'comic-sans', 'inter', 'roboto', 'display'] }, { 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'super' }, { 'script': 'sub' }],
      [{ 'header': '1' }, { 'header': '2' }, 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }, { 'align': [] }],
      ['link', 'image', 'video', 'formula'],
      ['table', 'emoji'],
      ['clean']
    ],"""

replacement = """    container: [
      [{ 'font': ['sans-serif', 'serif', 'monospace', 'comic-sans', 'inter', 'roboto', 'display'] }, { 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'super' }, { 'script': 'sub' }],
      [{ 'header': 1 }, { 'header': 2 }, 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }, { 'align': [] }],
      ['link', 'image', 'video', 'formula'],
      ['table', 'emoji'],
      ['clean']
    ],"""

content = content.replace(target, replacement)

with open('src/pages/Announcements.tsx', 'w') as f:
    f.write(content)
