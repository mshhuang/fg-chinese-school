with open('src/lib/i18n.tsx', 'r') as f:
    content = f.read()

new_translations = """
  "Upcoming Events": { en: "Upcoming Events", 'zh-CN': "即将举行的活动", 'zh-TW': "即將舉行的活動" },
"""

insert_pos = content.find('"New Announcement":')
if insert_pos != -1:
    content = content[:insert_pos] + new_translations + content[insert_pos:]
    with open('src/lib/i18n.tsx', 'w') as f:
        f.write(content)
    print("Added translations")
else:
    print("Could not find insert pos")
