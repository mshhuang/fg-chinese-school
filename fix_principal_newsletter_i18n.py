import re

with open('src/lib/i18n.tsx', 'r') as f:
    content = f.read()

new_translations = """
  "Review Newsletters": { en: "Review Newsletters", 'zh-CN': "审核电子报", 'zh-TW': "審核電子報" },
  "Approve or reject newsletters submitted by teachers.": { en: "Approve or reject newsletters submitted by teachers.", 'zh-CN': "批准或拒绝教师提交的电子报。", 'zh-TW': "批准或拒絕教師提交的電子報。" },
  "Search by title or author...": { en: "Search by title or author...", 'zh-CN': "按标题或作者搜索...", 'zh-TW': "按標題或作者搜索..." },
"""

insert_pos = content.find('"New Announcement":')
if insert_pos != -1:
    content = content[:insert_pos] + new_translations + content[insert_pos:]
    with open('src/lib/i18n.tsx', 'w') as f:
        f.write(content)
    print("Added translations")
else:
    print("Could not find insert pos")
