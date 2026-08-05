with open('src/lib/i18n.tsx', 'r') as f:
    text = f.read()

new_translations = """  "e.g. March Updates": { en: "e.g. March Updates", 'zh-CN': "例如：三月更新", 'zh-TW': "例如：三月更新" },
  "e.g. All Parents": { en: "e.g. All Parents", 'zh-CN': "例如：所有家长", 'zh-TW': "例如：所有家長" },
  "Provide a short summary...": { en: "Provide a short summary...", 'zh-CN': "提供简短的摘要...", 'zh-TW': "提供簡短的摘要..." },
"""
text = text.replace('const translations: Translations = {\n', 'const translations: Translations = {\n' + new_translations)

with open('src/lib/i18n.tsx', 'w') as f:
    f.write(text)
