with open('src/lib/i18n.tsx', 'r') as f:
    content = f.read()

new_translations = """
  "No events scheduled for this cosmic day.": { en: "No events scheduled for this cosmic day.", 'zh-CN': "这一天没有安排任何活动。", 'zh-TW': "這一天沒有安排任何活動。" },
"""

insert_pos = content.find('"New Announcement":')
if insert_pos != -1:
    content = content[:insert_pos] + new_translations + content[insert_pos:]
    with open('src/lib/i18n.tsx', 'w') as f:
        f.write(content)
    print("Added translations")
else:
    print("Could not find insert pos")
