import re

with open('src/pages/Announcements.tsx', 'r') as f:
    content = f.read()

# 1. Update font list to include kaiti
target_fonts1 = "Font.whitelist = ['sans-serif', 'serif', 'monospace', 'comic-sans', 'inter', 'roboto', 'display'];"
replace_fonts1 = "Font.whitelist = ['sans-serif', 'serif', 'monospace', 'comic-sans', 'inter', 'roboto', 'display', 'kaiti'];"
content = content.replace(target_fonts1, replace_fonts1)

target_fonts2 = "[{ 'font': ['sans-serif', 'serif', 'monospace', 'comic-sans', 'inter', 'roboto', 'display'] }"
replace_fonts2 = "[{ 'font': ['sans-serif', 'serif', 'monospace', 'comic-sans', 'inter', 'roboto', 'display', 'kaiti'] }"
content = content.replace(target_fonts2, replace_fonts2)

# 2. Remove Emoji from toolbar
content = content.replace("['table', 'emoji']", "['table']")
# Remove emoji handler
emoji_handler_target = """      emoji: function() {
        document.dispatchEvent(new CustomEvent('open-quill-emoji-modal', { detail: { quill: this.quill } }));
      },"""
content = content.replace(emoji_handler_target, "")

# 3. Add table handler
table_handler = """      table: function() {
        document.dispatchEvent(new CustomEvent('open-quill-table-modal', { detail: { quill: this.quill } }));
      },"""
content = content.replace("handlers: {", "handlers: {\n" + table_handler)

# 4. Add table in modules if not there, wait, the user didn't mention enabling table in modules explicitly but it might need it.
# `table: true` in `modules`
target_magic_url = "  magicUrl: true"
replace_magic_url = "  magicUrl: true,\n  table: true"
content = content.replace(target_magic_url, replace_magic_url)

with open('src/pages/Announcements.tsx', 'w') as f:
    f.write(content)
