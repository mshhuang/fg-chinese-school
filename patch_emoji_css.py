with open('src/index.css', 'r') as f:
    content = f.read()

target = """.ql-snow .ql-toolbar button.ql-emoji,
.ql-snow.ql-toolbar button.ql-emoji {
  width: 28px;
  height: 24px;
}"""
replacement = """.ql-snow .ql-toolbar button.ql-emoji,
.ql-snow.ql-toolbar button.ql-emoji {
  width: 28px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}"""

content = content.replace(target, replacement)

with open('src/index.css', 'w') as f:
    f.write(content)

