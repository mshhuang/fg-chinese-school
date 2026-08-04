with open('src/lib/i18n.tsx', 'r') as f:
    content = f.read()

new_translations = """
  "Clock Out": { en: "Clock Out", 'zh-CN': "打卡下班", 'zh-TW': "打卡下班" },
  "Edit Photo Highlight": { en: "Edit Photo Highlight", 'zh-CN': "编辑照片", 'zh-TW': "編輯照片" },
  "Post Photo": { en: "Post Photo", 'zh-CN': "发布照片", 'zh-TW': "發布照片" },
"""

insert_pos = content.find('"New Announcement":')

if insert_pos != -1:
    content = content[:insert_pos] + new_translations + content[insert_pos:]
    with open('src/lib/i18n.tsx', 'w') as f:
        f.write(content)
    print("Translations added successfully.")
else:
    print("Could not find insert pos")
