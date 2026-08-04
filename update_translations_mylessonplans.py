with open('src/lib/i18n.tsx', 'r') as f:
    content = f.read()

new_translations = """
  "Manage and collaborate on your curriculum via Google Docs or Slides.": { en: "Manage and collaborate on your curriculum via Google Docs or Slides.", 'zh-CN': "通过 Google Docs 或 Slides 管理并协作您的课程。", 'zh-TW': "透過 Google Docs 或 Slides 管理並協作您的課程。" },
  "Google Doc or Slide Link": { en: "Google Doc or Slide Link", 'zh-CN': "Google Doc or Slide 的链接", 'zh-TW': "Google Doc or Slide 的連結" },
  "Help": { en: "Help", 'zh-CN': "帮助", 'zh-TW': "幫助" },
  "Share a Google Doc or Slide link for administrators to view your curriculum.": { en: "Share a Google Doc or Slide link for administrators to view your curriculum.", 'zh-CN': "分享 Google Doc 或 Slide 链接，供管理员查看您的课程。", 'zh-TW': "分享 Google Doc 或 Slide 連結，供管理員查看您的課程。" },
"""

insert_pos = content.find('"New Announcement":')

if insert_pos != -1:
    content = content[:insert_pos] + new_translations + content[insert_pos:]
    with open('src/lib/i18n.tsx', 'w') as f:
        f.write(content)
    print("Translations added successfully.")
else:
    print("Could not find insert pos")
