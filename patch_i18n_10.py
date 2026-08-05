with open('src/lib/i18n.tsx', 'r') as f:
    text = f.read()

text = text.replace('"Clock In": { en: "Clock In", \'zh-CN\': "打卡上班", \'zh-TW\': "打卡上班" },', '"Clock In": { en: "Clock In", \'zh-CN\': "打卡", \'zh-TW\': "打卡" },')

new_translations = """  "Post First Photo": { en: "Post First Photo", 'zh-CN': "发布第一张照片", 'zh-TW': "發佈第一張照片" },
"""
text = text.replace('const translations: Translations = {', 'const translations: Translations = {\n' + new_translations)

with open('src/lib/i18n.tsx', 'w') as f:
    f.write(text)
