with open('src/lib/i18n.tsx', 'r') as f:
    content = f.read()

new_translations = """
  "Ready to Go Home": { en: "Ready to Go Home", 'zh-CN': "准备回家", 'zh-TW': "準備回家" },
"""

insert_pos = content.find('"New Announcement":')

if insert_pos != -1:
    content = content[:insert_pos] + new_translations + content[insert_pos:]
    with open('src/lib/i18n.tsx', 'w') as f:
        f.write(content)
    print("Translations added successfully.")
else:
    print("Could not find insert pos")
