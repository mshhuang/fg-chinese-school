with open('src/lib/i18n.tsx', 'r') as f:
    content = f.read()

new_terms = """
  "Edit Profile": { en: "Edit Profile", 'zh-CN': "编辑资料", 'zh-TW': "編輯資料" },
  "Save Changes": { en: "Save Changes", 'zh-CN': "保存更改", 'zh-TW': "儲存變更" },
  "Cancel": { en: "Cancel", 'zh-CN': "取消", 'zh-TW': "取消" },
  "Phone": { en: "Phone", 'zh-CN': "电话", 'zh-TW': "電話" },
  "Address": { en: "Address", 'zh-CN': "地址", 'zh-TW': "地址" },
  "Email": { en: "Email", 'zh-CN': "邮箱", 'zh-TW': "電子郵件" },
  "First Name": { en: "First Name", 'zh-CN': "名字", 'zh-TW': "名字" },
  "Last Name": { en: "Last Name", 'zh-CN': "姓氏", 'zh-TW': "姓氏" },
  "Date of Birth": { en: "Date of Birth", 'zh-CN': "出生日期", 'zh-TW': "出生日期" },
  "Grade": { en: "Grade", 'zh-CN': "年级", 'zh-TW': "年級" },
  "Role": { en: "Role", 'zh-CN': "角色", 'zh-TW': "角色" },
  "School": { en: "School", 'zh-CN': "学校", 'zh-TW': "學校" },
  "Personal Information": { en: "Personal Information", 'zh-CN': "个人信息", 'zh-TW': "個人資訊" },
  "Contact Information": { en: "Contact Information", 'zh-CN': "联系信息", 'zh-TW': "聯絡資訊" },
  "Emergency Contact": { en: "Emergency Contact", 'zh-CN': "紧急联系人", 'zh-TW': "緊急聯絡人" },
  "Medical Info": { en: "Medical Info", 'zh-CN': "医疗信息", 'zh-TW': "醫療資訊" },
  "Save": { en: "Save", 'zh-CN': "保存", 'zh-TW': "儲存" },
  "Edit": { en: "Edit", 'zh-CN': "编辑", 'zh-TW': "編輯" },
  "Delete": { en: "Delete", 'zh-CN': "删除", 'zh-TW': "刪除" },
  "Add": { en: "Add", 'zh-CN': "添加", 'zh-TW': "新增" },
  "Search...": { en: "Search...", 'zh-CN': "搜索...", 'zh-TW': "搜尋..." },
  "Filter": { en: "Filter", 'zh-CN': "筛选", 'zh-TW': "篩選" },
  "Status": { en: "Status", 'zh-CN': "状态", 'zh-TW': "狀態" },
  "Title": { en: "Title", 'zh-CN': "标题", 'zh-TW': "標題" },
  "Date": { en: "Date", 'zh-CN': "日期", 'zh-TW': "日期" },
  "Time": { en: "Time", 'zh-CN': "时间", 'zh-TW': "時間" },
  "Location": { en: "Location", 'zh-CN': "地点", 'zh-TW': "地點" },
  "Description": { en: "Description", 'zh-CN': "描述", 'zh-TW': "描述" },
  "All": { en: "All", 'zh-CN': "全部", 'zh-TW': "全部" },
  "None": { en: "None", 'zh-CN': "无", 'zh-TW': "無" },
  "Submit": { en: "Submit", 'zh-CN': "提交", 'zh-TW': "提交" },
  "Send": { en: "Send", 'zh-CN': "发送", 'zh-TW': "發送" },
  "Reply": { en: "Reply", 'zh-CN': "回复", 'zh-TW': "回覆" },
  "Subject": { en: "Subject", 'zh-CN': "主题", 'zh-TW': "主旨" },
"""

content = content.replace("  // Dashboards & Common", "  // Dashboards & Common\n" + new_terms)

with open('src/lib/i18n.tsx', 'w') as f:
    f.write(content)

