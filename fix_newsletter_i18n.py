import re

with open('src/lib/i18n.tsx', 'r') as f:
    content = f.read()

new_translations = """
  "Class Newsletters": { en: "Class Newsletters", 'zh-CN': "班级电子报", 'zh-TW': "班級電子報" },
  "Create newsletters and submit them for approval.": { en: "Create newsletters and submit them for approval.", 'zh-CN': "创建电子报并提交审批。", 'zh-TW': "創建電子報並提交審批。" },
  "Create Newsletter": { en: "Create Newsletter", 'zh-CN': "创建电子报", 'zh-TW': "創建電子報" },
  "All": { en: "All", 'zh-CN': "全部", 'zh-TW': "全部" },
  "Draft": { en: "Draft", 'zh-CN': "草稿", 'zh-TW': "草稿" },
  "Pending Approval": { en: "Pending Approval", 'zh-CN': "待审批", 'zh-TW': "待審批" },
  "Rejected": { en: "Rejected", 'zh-CN': "已拒绝", 'zh-TW': "已拒絕" },
  "Approved": { en: "Approved", 'zh-CN': "已批准", 'zh-TW': "已批准" },
  "Published": { en: "Published", 'zh-CN': "已发布", 'zh-TW': "已發布" },
  "Search newsletters...": { en: "Search newsletters...", 'zh-CN': "搜索电子报...", 'zh-TW': "搜索電子報..." },
  "No newsletters found": { en: "No newsletters found", 'zh-CN': "未找到电子报", 'zh-TW': "未找到電子報" },
  "No newsletters awaiting review": { en: "No newsletters awaiting review", 'zh-CN': "没有等待审核的电子报", 'zh-TW': "沒有等待審核的電子報" },
"""

insert_pos = content.find('"New Announcement":')
if insert_pos != -1:
    content = content[:insert_pos] + new_translations + content[insert_pos:]
    with open('src/lib/i18n.tsx', 'w') as f:
        f.write(content)
    print("Added translations")
else:
    print("Could not find insert pos")
