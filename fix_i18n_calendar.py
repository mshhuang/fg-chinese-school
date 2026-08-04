with open('src/lib/i18n.tsx', 'r') as f:
    content = f.read()

new_translations = """
  "School Calendar": { en: "School Calendar", 'zh-CN': "校历", 'zh-TW': "校曆" },
  "View upcoming events, holidays, and academic schedules.": { en: "View upcoming events, holidays, and academic schedules.", 'zh-CN': "查看即将举行的活动、假期和教学计划。", 'zh-TW': "查看即將舉行的活動、假期和教學計劃。" },
  "View upcoming events, shifts, and school activities.": { en: "View upcoming events, shifts, and school activities.", 'zh-CN': "查看即将举行的活动、班次和学校活动。", 'zh-TW': "查看即將舉行的活動、班次和學校活動。" },
  "Event Calendar": { en: "Event Calendar", 'zh-CN': "活动日历", 'zh-TW': "活動日曆" },
  "EVENTS": { en: "EVENTS", 'zh-CN': "活动", 'zh-TW': "活動" },
  "Upcoming": { en: "Upcoming", 'zh-CN': "即将到来", 'zh-TW': "即將到來" },
  "schedule": { en: "schedule", 'zh-CN': "日程", 'zh-TW': "日程" },
  "No upcoming events.": { en: "No upcoming events.", 'zh-CN': "没有即将举行的活动。", 'zh-TW': "沒有即將舉行的活動。" },
"""

insert_pos = content.find('"New Announcement":')
if insert_pos != -1:
    content = content[:insert_pos] + new_translations + content[insert_pos:]
    with open('src/lib/i18n.tsx', 'w') as f:
        f.write(content)
    print("Added translations")
else:
    print("Could not find insert pos")
