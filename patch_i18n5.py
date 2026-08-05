with open('src/lib/i18n.tsx', 'r') as f:
    text = f.read()

new_translations = """  "Volunteer Portal": { en: "Volunteer Portal", 'zh-CN': "志愿者门户", 'zh-TW': "志工入口網站" },
  "View your upcoming shifts, events, and manage daily operations.": { en: "View your upcoming shifts, events, and manage daily operations.", 'zh-CN': "查看您即将到来的班次、活动，并管理日常运营。", 'zh-TW': "查看您即將到來的班次、活動，並管理日常營運。" },
  "Operations": { en: "Operations", 'zh-CN': "运营", 'zh-TW': "營運" },
  "Scan student or staff ID badges": { en: "Scan student or staff ID badges", 'zh-CN': "扫描学生或教职员工身份证", 'zh-TW': "掃描學生或教職員工身份證" },
  "Daily Attendance": { en: "Daily Attendance", 'zh-CN': "每日出勤", 'zh-TW': "每日出勤" },
  "Submit student headcount and reports": { en: "Submit student headcount and reports", 'zh-CN': "提交学生人数和报告", 'zh-TW': "提交學生人數和報告" },
  "Quick Actions": { en: "Quick Actions", 'zh-CN': "快捷操作", 'zh-TW': "快捷操作" },
  "Contact staff and teachers": { en: "Contact staff and teachers", 'zh-CN': "联系教职员工和老师", 'zh-TW': "聯繫教職員工和老師" },
  "View Announcements": { en: "View Announcements", 'zh-CN': "查看公告", 'zh-TW': "查看公告" },
  "Stay updated with school news": { en: "Stay updated with school news", 'zh-CN': "随时了解学校新闻", 'zh-TW': "隨時了解學校新聞" },
"""

text = text.replace('const translations: Translations = {', 'const translations: Translations = {\n' + new_translations)

with open('src/lib/i18n.tsx', 'w') as f:
    f.write(text)
