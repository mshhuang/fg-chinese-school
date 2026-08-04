import re

with open('src/lib/i18n.tsx', 'r') as f:
    content = f.read()

new_translations = """
  "Something went wrong": { en: "Something went wrong", 'zh-CN': "出错了", 'zh-TW': "出錯了" },
  "An unexpected error occurred. We've logged this issue for our system builders to investigate.": { en: "An unexpected error occurred. We've logged this issue for our system builders to investigate.", 'zh-CN': "发生意外错误。我们已记录此问题，系统构建者将进行调查。", 'zh-TW': "發生意外錯誤。我們已記錄此問題，系統構建者將進行調查。" },
  "Refresh Page": { en: "Refresh Page", 'zh-CN': "刷新页面", 'zh-TW': "刷新頁面" },
"""

insert_pos = content.find('"New Announcement":')
if insert_pos != -1:
    content = content[:insert_pos] + new_translations + content[insert_pos:]
    with open('src/lib/i18n.tsx', 'w') as f:
        f.write(content)
    print("Added translations")
else:
    print("Could not find insert pos")
