with open('src/lib/i18n.tsx', 'r') as f:
    content = f.read()

new_translations = """
  "No users matched your search.": { en: "No users matched your search.", 'zh-CN': "没有用户符合您的搜索。", 'zh-TW': "沒有用戶符合您的搜尋。" },
"""

insert_pos = content.find('"New Announcement":')

if insert_pos != -1:
    content = content[:insert_pos] + new_translations + content[insert_pos:]
    with open('src/lib/i18n.tsx', 'w') as f:
        f.write(content)
    print("Translations added successfully.")
else:
    print("Could not find insert pos")
