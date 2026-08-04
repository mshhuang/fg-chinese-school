with open('src/lib/i18n.tsx', 'r') as f:
    content = f.read()

new_translations = """
  "Homeroom Teacher": { en: "Homeroom Teacher", 'zh-CN': "主班老师", 'zh-TW': "班導師" },
  "Co-Teacher": { en: "Co-Teacher", 'zh-CN': "配班老师", 'zh-TW': "搭班老師" },
  "co-teacher classes.": { en: "co-teacher classes.", 'zh-CN': "个配班老师班级。", 'zh-TW': "個搭班老師班級。" },
  "homeroom classes and": { en: "homeroom classes and", 'zh-CN': "个主班老师班级和", 'zh-TW': "個班導師班級和" },
  "QR scanner": { en: "QR scanner", 'zh-CN': "二维码扫描器", 'zh-TW': "QR 掃描器" },
  "clock in": { en: "clock in", 'zh-CN': "打卡", 'zh-TW': "打卡" },
  "post photo": { en: "post photo", 'zh-CN': "发布照片", 'zh-TW': "發布照片" },
  "Photo Information": { en: "Photo Information", 'zh-CN': "照片信息", 'zh-TW': "照片資訊" },
"""

insert_pos = content.find('"New Announcement":')

if insert_pos != -1:
    content = content[:insert_pos] + new_translations + content[insert_pos:]
    with open('src/lib/i18n.tsx', 'w') as f:
        f.write(content)
    print("Translations added successfully.")
else:
    print("Could not find insert pos")
