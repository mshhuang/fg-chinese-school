import re

with open('src/lib/i18n.tsx', 'r') as f:
    content = f.read()

new_translations = """
  "Choose a user...": { en: "Choose a user...", 'zh-CN': "选择一个用户...", 'zh-TW': "選擇一個用戶..." },
"""

insert_pos = content.find('"New Announcement":')
if insert_pos == -1:
    insert_pos = content.find('"Edit Profile":')

if insert_pos != -1:
    content = content[:insert_pos] + new_translations + content[insert_pos:]
    with open('src/lib/i18n.tsx', 'w') as f:
        f.write(content)
    print("Translations added successfully.")
else:
    print("Could not find insert pos")
