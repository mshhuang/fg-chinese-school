with open('src/index.css', 'r') as f:
    content = f.read()

font_css = """
/* Quill Custom Fonts Dropdown Labels */
.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="sans-serif"]::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="sans-serif"]::before {
  content: 'Sans Serif';
}
.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="serif"]::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="serif"]::before {
  content: 'Serif';
}
.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="monospace"]::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="monospace"]::before {
  content: 'Monospace';
}
.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="comic-sans"]::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="comic-sans"]::before {
  content: 'Comic Sans';
}
.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="inter"]::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="inter"]::before {
  content: 'Inter';
}
.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="roboto"]::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="roboto"]::before {
  content: 'Roboto';
}
.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="display"]::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="display"]::before {
  content: 'Display';
}
.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="kaiti"]::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="kaiti"]::before {
  content: 'Kaiti';
}

.ql-font-kaiti {
  font-family: 'KaiTi', 'STKaiti', 'BiauKai', serif;
}
"""

if "/* Quill Custom Fonts Dropdown Labels */" not in content:
    content += font_css

with open('src/index.css', 'w') as f:
    f.write(content)
