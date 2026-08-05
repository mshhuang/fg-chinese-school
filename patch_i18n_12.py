with open('src/lib/i18n.tsx', 'r') as f:
    text = f.read()

new_translations = """  "No file linked yet.": { en: "No file linked yet.", 'zh-CN': "尚未链接文件。", 'zh-TW': "尚未連結檔案。" },
  "Google File": { en: "Google File", 'zh-CN': "Google 文件", 'zh-TW': "Google 檔案" },
"""
text = text.replace('const translations: Translations = {', 'const translations: Translations = {\n' + new_translations)

with open('src/lib/i18n.tsx', 'w') as f:
    f.write(text)
