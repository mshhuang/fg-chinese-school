with open('src/lib/i18n.tsx', 'r') as f:
    content = f.read()

new_translations = """
  "Active": { en: "Active", 'zh-CN': "活动", 'zh-TW': "活動" },
  "History": { en: "History", 'zh-CN': "历史记录", 'zh-TW': "歷史記錄" },
  "No active assignments.": { en: "No active assignments.", 'zh-CN': "没有活动的作业。", 'zh-TW': "沒有活動的作業。" },
"""

insert_pos = content.find('"New Announcement":')
if insert_pos != -1:
    content = content[:insert_pos] + new_translations + content[insert_pos:]
    with open('src/lib/i18n.tsx', 'w') as f:
        f.write(content)
    print("Added translations")
else:
    print("Could not find insert pos")
