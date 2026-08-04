import re

with open('src/lib/i18n.tsx', 'r') as f:
    content = f.read()

new_translations = """  // Principal Dashboard
  "Here is what's happening at your school today.": { en: "Here is what's happening at your school today.", 'zh-CN': "这是您学校今天的情况。", 'zh-TW': "這是您學校今天的情況。" },
  "Quick Stats": { en: "Quick Stats", 'zh-CN': "快速统计", 'zh-TW': "快速統計" },
  "Total Students": { en: "Total Students", 'zh-CN': "学生总数", 'zh-TW': "學生總數" },
  "Active Classes": { en: "Active Classes", 'zh-CN': "活跃班级", 'zh-TW': "活躍班級" },
  "Absences Today": { en: "Absences Today", 'zh-CN': "今日缺勤", 'zh-TW': "今日缺勤" },
  "Attendance Overview": { en: "Attendance Overview", 'zh-CN': "考勤概览", 'zh-TW': "考勤概覽" },
  "Recent Activity": { en: "Recent Activity", 'zh-CN': "最近活动", 'zh-TW': "最近活動" },
  "Latest Announcements": { en: "Latest Announcements", 'zh-CN': "最新公告", 'zh-TW': "最新公告" },
  "View All": { en: "View All", 'zh-CN': "查看全部", 'zh-TW': "查看全部" },
"""

if '"Quick Stats"' not in content:
    content = content.replace('  // Dashboards & Common', new_translations + '\n  // Dashboards & Common')

with open('src/lib/i18n.tsx', 'w') as f:
    f.write(content)

