with open('src/lib/i18n.tsx', 'r') as f:
    text = f.read()

new_translations = """  "No Photo Highlights Found": { en: "No Photo Highlights Found", 'zh-CN': "未找到照片集锦", 'zh-TW': "未找到照片集錦" },
  "No photo highlights match the selected class filter. Teachers can post classroom photos with target audience settings.": { en: "No photo highlights match the selected class filter. Teachers can post classroom photos with target audience settings.", 'zh-CN': "没有与所选班级过滤器匹配的照片。教师可以发布包含目标受众设置的课堂照片。", 'zh-TW': "沒有與所選班級過濾器匹配的照片。教師可以發佈包含目標受眾設置的課堂照片。" },
"""

text = text.replace('const translations: Translations = {', 'const translations: Translations = {\n' + new_translations)

with open('src/lib/i18n.tsx', 'w') as f:
    f.write(text)
