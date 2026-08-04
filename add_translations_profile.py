with open('src/lib/i18n.tsx', 'r') as f:
    content = f.read()

new_translations = """
  "My Information": { en: "My Information", 'zh-CN': "我的信息", 'zh-TW': "我的資訊" },
  "View and edit your personal details and contact information.": { en: "View and edit your personal details and contact information.", 'zh-CN': "查看和编辑您的个人详细信息和联系方式。", 'zh-TW': "查看和編輯您的個人詳細資訊和聯絡方式。" },
  "Personal Details": { en: "Personal Details", 'zh-CN': "个人资料", 'zh-TW': "個人資料" },
  "Username": { en: "Username", 'zh-CN': "用户名", 'zh-TW': "用戶名" },
  "Primary Phone": { en: "Primary Phone", 'zh-CN': "主要电话", 'zh-TW': "主要電話" },
  "Secondary Phone": { en: "Secondary Phone", 'zh-CN': "备用电话", 'zh-TW': "備用電話" },
  "Health & Emergency": { en: "Health & Emergency", 'zh-CN': "健康与紧急情况", 'zh-TW': "健康與緊急情況" },
  "None specified": { en: "None specified", 'zh-CN': "未指定", 'zh-TW': "未指定" },
  "Medical Conditions / Allergies": { en: "Medical Conditions / Allergies", 'zh-CN': "医疗状况 / 过敏", 'zh-TW': "醫療狀況 / 過敏" },
  "Account Security": { en: "Account Security", 'zh-CN': "账户安全", 'zh-TW': "帳戶安全" },
  "Keep your account secure by updating your password regularly.": { en: "Keep your account secure by updating your password regularly.", 'zh-CN': "定期更新密码以确保您的账户安全。", 'zh-TW': "定期更新密碼以確保您的帳戶安全。" },
  "Change Password": { en: "Change Password", 'zh-CN': "更改密码", 'zh-TW': "更改密碼" },
"""

insert_pos = content.find('"New Announcement":')

if insert_pos != -1:
    content = content[:insert_pos] + new_translations + content[insert_pos:]
    with open('src/lib/i18n.tsx', 'w') as f:
        f.write(content)
    print("Translations added successfully.")
else:
    print("Could not find insert pos")
