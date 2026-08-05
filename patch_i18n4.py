with open('src/lib/i18n.tsx', 'r') as f:
    text = f.read()

new_translations = """  "My Programs": { en: "My Programs", 'zh-CN': "我的项目", 'zh-TW': "我的項目" },
  "View All": { en: "View All", 'zh-CN': "查看全部", 'zh-TW': "查看全部" },
"""

text = text.replace('const translations: Translations = {', 'const translations: Translations = {\n' + new_translations)

with open('src/lib/i18n.tsx', 'w') as f:
    f.write(text)
