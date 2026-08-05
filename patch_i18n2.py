with open('src/lib/i18n.tsx', 'r') as f:
    text = f.read()

new_translations = """  "Open Full Calendar": { en: "Open Full Calendar", 'zh-CN': "打开完整日历", 'zh-TW': "打開完整日曆" },
  "Manage your homework and projects.": { en: "Manage your homework and projects.", 'zh-CN': "管理你的家庭作业和项目。", 'zh-TW': "管理你的家庭作業和專案。" },
  "All Assignments": { en: "All Assignments", 'zh-CN': "所有作业", 'zh-TW': "所有作業" },
  "To Do": { en: "To Do", 'zh-CN': "待办事项", 'zh-TW': "待辦事項" },
  "Completed": { en: "Completed", 'zh-CN': "已完成", 'zh-TW': "已完成" },
  "All caught up!": { en: "All caught up!", 'zh-CN': "一切都已完成！", 'zh-TW': "一切都已完成！" },
"""

text = text.replace('const translations: Translations = {', 'const translations: Translations = {\n' + new_translations)

with open('src/lib/i18n.tsx', 'w') as f:
    f.write(text)
