with open('src/lib/i18n.tsx', 'r') as f:
    text = f.read()

new_translations = """  "Today's Assignment": { en: "Today's Assignment", 'zh-CN': "今日作业", 'zh-TW': "今日作業" },
  "Tasks Left": { en: "Tasks Left", 'zh-CN': "项待办任务", 'zh-TW': "項待辦任務" },
  "Achievements": { en: "Achievements", 'zh-CN': "成就", 'zh-TW': "成就" },
  "Days": { en: "Days", 'zh-CN': "天", 'zh-TW': "天" },
"""

text = text.replace('const translations: Translations = {', 'const translations: Translations = {\n' + new_translations)

with open('src/lib/i18n.tsx', 'w') as f:
    f.write(text)
