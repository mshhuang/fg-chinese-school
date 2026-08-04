with open('src/lib/i18n.tsx', 'r') as f:
    content = f.read()

new_translations = """
  "No assignment history.": { en: "No assignment history.", 'zh-CN': "没有历史作业。", 'zh-TW': "沒有歷史作業。" },
"""

insert_pos = content.find('"New Announcement":')
if insert_pos != -1:
    content = content[:insert_pos] + new_translations + content[insert_pos:]
    with open('src/lib/i18n.tsx', 'w') as f:
        f.write(content)
    print("Added translations")
else:
    print("Could not find insert pos")
