with open('src/lib/i18n.tsx', 'r') as f:
    content = f.read()

new_translations = """
  "Compose Announcement": { en: "Compose Announcement", 'zh-CN': "撰写公告", 'zh-TW': "撰寫公告" },
  "Everyone": { en: "Everyone", 'zh-CN': "所有人", 'zh-TW': "所有人" },
  "Specific roles": { en: "Specific roles", 'zh-CN': "特定角色", 'zh-TW': "特定角色" },
  "Specific classes": { en: "Specific classes", 'zh-CN': "特定班级", 'zh-TW': "特定班級" },
  "Specific users": { en: "Specific users", 'zh-CN': "特定用户", 'zh-TW': "特定用戶" },
"""

insert_pos = content.find('"New Announcement":')
if insert_pos != -1:
    content = content[:insert_pos] + new_translations + content[insert_pos:]
    with open('src/lib/i18n.tsx', 'w') as f:
        f.write(content)
    print("Added translations")
else:
    print("Could not find insert pos")
