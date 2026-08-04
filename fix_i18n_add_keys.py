import re

with open('src/lib/i18n.tsx', 'r') as f:
    content = f.read()

new_keys = """
  "Schedule TBD": { en: "Schedule TBD", 'zh-CN': "时间待定", 'zh-TW': "時間待定" },
  "Room TBD": { en: "Room TBD", 'zh-CN': "教室待定", 'zh-TW': "教室待定" },
  "Students Enrolled": { en: "Students Enrolled", 'zh-CN': "名已注册学生", 'zh-TW': "名已註冊學生" },
  "Assign Homework": { en: "Assign Homework", 'zh-CN': "布置作业", 'zh-TW': "指派作業" },
  "Search classes...": { en: "Search classes...", 'zh-CN': "搜索课程...", 'zh-TW': "搜尋課程..." },
  "School-wide Schedule": { en: "School-wide Schedule", 'zh-CN': "全校时间表", 'zh-TW': "全校時間表" },
  "View Full Size": { en: "View Full Size", 'zh-CN': "查看全尺寸", 'zh-TW': "查看全尺寸" },
  "No school-wide schedule uploaded yet.": { en: "No school-wide schedule uploaded yet.", 'zh-CN': "尚未上传全校时间表。", 'zh-TW': "尚未上傳全校時間表。" },
"""

# Insert right after `// Teacher Classes` or anywhere
if "// Teacher Classes" in content:
    content = content.replace("// Teacher Classes", "// Teacher Classes" + new_keys)
else:
    content = content.replace("export const translations: Record<string, Record<Language, string>> = {", "export const translations: Record<string, Record<Language, string>> = {\n" + new_keys)

with open('src/lib/i18n.tsx', 'w') as f:
    f.write(content)
