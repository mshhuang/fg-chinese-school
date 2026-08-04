import re

with open('src/lib/i18n.tsx', 'r') as f:
    content = f.read()

new_translations = """
  "Search recent chats...": { en: "Search recent chats...", 'zh-CN': "搜索最近的聊天...", 'zh-TW': "搜尋最近的聊天..." },
  "No conversations found": { en: "No conversations found", 'zh-CN': "未找到对话", 'zh-TW': "未找到對話" },
  "Search for users above to start a new conversation.": { en: "Search for users above to start a new conversation.", 'zh-CN': "在上方搜索用户以开始新的对话。", 'zh-TW': "在上方搜尋用戶以開始新的對話。" },
  "Compose Message": { en: "Compose Message", 'zh-CN': "写信息", 'zh-TW': "撰寫訊息" },
  "Select a user below to start a conversation": { en: "Select a user below to start a conversation", 'zh-CN': "在下方选择用户以开始对话", 'zh-TW': "在下方選擇用戶以開始對話" },
  "Select Recipient": { en: "Select Recipient", 'zh-CN': "选择收件人", 'zh-TW': "選擇收件人" },
  "Select a user": { en: "Select a user", 'zh-CN': "选择用户", 'zh-TW': "選擇用戶" },
"""

insert_pos = content.find('"New Announcement":')
if insert_pos == -1:
    insert_pos = content.find('"Edit Profile":')

if insert_pos != -1:
    content = content[:insert_pos] + new_translations + content[insert_pos:]
    with open('src/lib/i18n.tsx', 'w') as f:
        f.write(content)
    print("Translations added successfully.")
else:
    print("Could not find insert pos")
