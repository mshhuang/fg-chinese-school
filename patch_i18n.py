with open('src/lib/i18n.tsx', 'r') as f:
    text = f.read()

new_translations = """  "Your journey of knowledge continues. You're doing great!": { en: "Your journey of knowledge continues. You're doing great!", 'zh-CN': "你的求知之旅还在继续，你做得很棒！", 'zh-TW': "你的求知之旅還在繼續，你做得很棒！" },
  "Linked Family:": { en: "Linked Family:", 'zh-CN': "关联的家庭成员:", 'zh-TW': "關聯的家庭成員:" },
"""

text = text.replace('const translations: Translations = {', 'const translations: Translations = {\n' + new_translations)

with open('src/lib/i18n.tsx', 'w') as f:
    f.write(text)
