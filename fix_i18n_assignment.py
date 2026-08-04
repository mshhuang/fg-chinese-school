with open('src/lib/i18n.tsx', 'r') as f:
    content = f.read()

new_translations = """
  "Type": { en: "Type", 'zh-CN': "类型", 'zh-TW': "類型" },
  "Description (Optional)": { en: "Description (Optional)", 'zh-CN': "描述 (可选)", 'zh-TW': "描述 (可選)" },
  "Attachments": { en: "Attachments", 'zh-CN': "附件", 'zh-TW': "附件" },
  "Add File Attachment": { en: "Add File Attachment", 'zh-CN': "添加文件附件", 'zh-TW': "添加文件附件" },
  "Max size 2MB": { en: "Max size 2MB", 'zh-CN': "最大尺寸 2MB", 'zh-TW': "最大尺寸 2MB" },
  "Due Date": { en: "Due Date", 'zh-CN': "截止日期", 'zh-TW': "截止日期" },
  "Assign To Students": { en: "Assign To Students", 'zh-CN': "分配给学生", 'zh-TW': "分配給學生" },
  "Select All": { en: "Select All", 'zh-CN': "全选", 'zh-TW': "全選" },
  "Deselect All": { en: "Deselect All", 'zh-CN': "取消全选", 'zh-TW': "取消全選" },
  "Save Assignment": { en: "Save Assignment", 'zh-CN': "保存作业", 'zh-TW': "保存作業" },
  "Saving...": { en: "Saving...", 'zh-CN': "保存中...", 'zh-TW': "儲存中..." },
  "Cancel": { en: "Cancel", 'zh-CN': "取消", 'zh-TW': "取消" },
"""

insert_pos = content.find('"New Announcement":')
if insert_pos != -1:
    content = content[:insert_pos] + new_translations + content[insert_pos:]
    with open('src/lib/i18n.tsx', 'w') as f:
        f.write(content)
    print("Added translations")
else:
    print("Could not find insert pos")
