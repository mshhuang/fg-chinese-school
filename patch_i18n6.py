with open('src/lib/i18n.tsx', 'r') as f:
    text = f.read()

new_translations = """  "School Check-in Scanner": { en: "School Check-in Scanner", 'zh-CN': "学校签到扫描仪", 'zh-TW': "學校簽到掃描儀" },
  "Scan QR codes to record daily building arrival for students, teachers, and staff.": { en: "Scan QR codes to record daily building arrival for students, teachers, and staff.", 'zh-CN': "扫描二维码记录学生、教师和教职员工的每日到校情况。", 'zh-TW': "掃描二維碼記錄學生、教師和教職員工的每日到校情況。" },
"""

text = text.replace('const translations: Translations = {', 'const translations: Translations = {\n' + new_translations)

with open('src/lib/i18n.tsx', 'w') as f:
    f.write(text)
