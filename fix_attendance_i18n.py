with open('src/lib/i18n.tsx', 'r') as f:
    content = f.read()

new_translations = """
  "Attendance Sheet": { en: "Attendance Sheet", 'zh-CN': "出勤表", 'zh-TW': "出勤表" },
  "Submit the student attendance by class for today's sessions.": { en: "Submit the student attendance by class for today's sessions.", 'zh-CN': "按班级提交今天课程的学生出勤情况。", 'zh-TW': "按班級提交今天課程的學生出勤情況。" },
  "Select a Class": { en: "Select a Class", 'zh-CN': "选择一个班级", 'zh-TW': "選擇一個班級" },
  "Student Name": { en: "Student Name", 'zh-CN': "学生姓名", 'zh-TW': "學生姓名" },
  "Building Status": { en: "Building Status", 'zh-CN': "在校状态", 'zh-TW': "在校狀態" },
  "Ready to Go Home": { en: "Ready to Go Home", 'zh-CN': "准备回家", 'zh-TW': "準備回家" },
  "Attendance": { en: "Attendance", 'zh-CN': "出勤", 'zh-TW': "出勤" },
  "Notes": { en: "Notes", 'zh-CN': "备注", 'zh-TW': "備註" },
  "Submit": { en: "Submit", 'zh-CN': "提交", 'zh-TW': "提交" },
"""

insert_pos = content.find('"New Announcement":')
if insert_pos != -1:
    content = content[:insert_pos] + new_translations + content[insert_pos:]
    with open('src/lib/i18n.tsx', 'w') as f:
        f.write(content)
    print("Added translations")
else:
    print("Could not find insert pos")
