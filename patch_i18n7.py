with open('src/lib/i18n.tsx', 'r') as f:
    text = f.read()

new_translations = """  "Switch Role View": { en: "Switch Role View", 'zh-CN': "切换角色视图", 'zh-TW': "切換角色視圖" },
  "Switch Role": { en: "Switch Role", 'zh-CN': "切换角色", 'zh-TW': "切換角色" },
  "Teacher": { en: "Teacher", 'zh-CN': "老师", 'zh-TW': "老師" },
  "Student": { en: "Student", 'zh-CN': "学生", 'zh-TW': "學生" },
  "Parent": { en: "Parent", 'zh-CN': "家长", 'zh-TW': "家長" },
  "School Admin": { en: "School Admin", 'zh-CN': "学校管理员", 'zh-TW': "學校管理員" },
  "Volunteer": { en: "Volunteer", 'zh-CN': "志愿者", 'zh-TW': "志工" },
  "Builder": { en: "Builder", 'zh-CN': "系统管理员", 'zh-TW': "系統管理員" },
  "Staff": { en: "Staff", 'zh-CN': "教职员工", 'zh-TW': "教職員工" },
"""

text = text.replace('const translations: Translations = {', 'const translations: Translations = {\n' + new_translations)

with open('src/lib/i18n.tsx', 'w') as f:
    f.write(text)
