import re

with open('src/lib/i18n.tsx', 'r') as f:
    content = f.read()

new_translations = """
  "You have": { en: "You have", 'zh-CN': "您有", 'zh-TW': "您有" },
"""

insert_pos = content.find('"New Announcement":')

if insert_pos != -1:
    content = content[:insert_pos] + new_translations + content[insert_pos:]
    with open('src/lib/i18n.tsx', 'w') as f:
        f.write(content)
    print("Translations added successfully.")
else:
    print("Could not find insert pos")
