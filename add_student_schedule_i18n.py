with open('src/lib/i18n.tsx', 'r') as f:
    content = f.read()

new_translations = """
  "View your daily timetable and upcoming events.": { en: "View your daily timetable and upcoming events.", 'zh-CN': "查看您的每日时间表和即将举行的活动。", 'zh-TW': "查看您的每日時間表和即將舉行的活動。" },
  "MY SCHEDULE": { en: "MY SCHEDULE", 'zh-CN': "我的时间表", 'zh-TW': "我的時間表" },
  "UPCOMING": { en: "UPCOMING", 'zh-CN': "即将到来", 'zh-TW': "即將到來" },
  "No schedule image available.": { en: "No schedule image available.", 'zh-CN': "没有可用的时间表图像。", 'zh-TW': "沒有可用的時間表圖像。" },
"""

insert_pos = content.find('"New Announcement":')
if insert_pos != -1:
    content = content[:insert_pos] + new_translations + content[insert_pos:]
    with open('src/lib/i18n.tsx', 'w') as f:
        f.write(content)
    print("Added translations")
else:
    print("Could not find insert pos")
