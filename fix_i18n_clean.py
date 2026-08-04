import re

with open('src/lib/i18n.tsx', 'r') as f:
    content = f.read()

# The duplicates we found:
# 'No Classes Assigned'
# 'All Classes'
# 'Cancel'
# 'Title'
# 'All'

translations_to_add = {
    # Roster & Attendance
    'Room': {'en': 'Room', 'zh-CN': '教室', 'zh-TW': '教室'},
    'TBD': {'en': 'TBD', 'zh-CN': '待定', 'zh-TW': '待定'},
    'Students': {'en': 'Students', 'zh-CN': '名学生', 'zh-TW': '名學生'},
    'Teaching Team': {'en': 'Teaching Team', 'zh-CN': '教学团队', 'zh-TW': '教學團隊'},
    'Lead:': {'en': 'Lead:', 'zh-CN': '主班老师:', 'zh-TW': '主班老師:'},
    'Co-teacher:': {'en': 'Co-teacher:', 'zh-CN': '配班老师:', 'zh-TW': '配班老師:'},
    'Management Tools': {'en': 'Management Tools', 'zh-CN': '管理工具', 'zh-TW': '管理工具'},
    'Track & view sheets': {'en': 'Track & view sheets', 'zh-CN': '跟踪和查看记录', 'zh-TW': '追蹤和查看記錄'},
    'Manage tasks': {'en': 'Manage tasks', 'zh-CN': '管理任务', 'zh-TW': '管理任務'},
    'Class Notes': {'en': 'Class Notes', 'zh-CN': '课堂笔记', 'zh-TW': '課堂筆記'},
    'Observations': {'en': 'Observations', 'zh-CN': '观察记录', 'zh-TW': '觀察記錄'},
    'Performance': {'en': 'Performance', 'zh-CN': '表现', 'zh-TW': '表現'},
    'Class metrics': {'en': 'Class metrics', 'zh-CN': '班级指标', 'zh-TW': '班級指標'},
    'Student Roster': {'en': 'Student Roster', 'zh-CN': '学生名单', 'zh-TW': '學生名單'},
    'Search students...': {'en': 'Search students...', 'zh-CN': '搜索学生...', 'zh-TW': '搜尋學生...'},
    'Load More Students': {'en': 'Load More Students', 'zh-CN': '加载更多学生', 'zh-TW': '載入更多學生'},
    'Present (In School)': {'en': 'Present (In School)', 'zh-CN': '出勤 (在校)', 'zh-TW': '出勤 (在校)'},
    'Checked Out (Left School)': {'en': 'Checked Out (Left School)', 'zh-CN': '已签退 (离校)', 'zh-TW': '已簽退 (離校)'},
    'Absent': {'en': 'Absent', 'zh-CN': '缺勤', 'zh-TW': '缺勤'},
    'Not Arrived': {'en': 'Not Arrived', 'zh-CN': '未到', 'zh-TW': '未到'},
    'Late': {'en': 'Late', 'zh-CN': '迟到', 'zh-TW': '遲到'},
    'Excused': {'en': 'Excused', 'zh-CN': '请假', 'zh-TW': '請假'},
    'arrived_at': {'en': '{name} arrived at school at {time} on {date}', 'zh-CN': '{name} 在 {date} {time} 到校', 'zh-TW': '{name} 在 {date} {time} 到校'},
    'no_classes_assigned_desc': {'en': 'You are not currently assigned as a primary or co-teacher for any classes. If you believe this is an error, please contact the administration.', 'zh-CN': '您目前未被指定为任何班级的主班或配班老师。如果您认为这是一个错误，请联系管理部门。', 'zh-TW': '您目前未被指定為任何班級的主班或配班老師。如果您認為這是一個錯誤，請聯絡管理部門。'},
    'You': {'en': 'You', 'zh-CN': '你', 'zh-TW': '你'},
    
    # Assignments
    'Manage homework and assignments for your classes.': {'en': 'Manage homework and assignments for your classes.', 'zh-CN': '管理班级的作业和任务。', 'zh-TW': '管理班級的作業和任務。'},
    'Select Class:': {'en': 'Select Class:', 'zh-CN': '选择班级:', 'zh-TW': '選擇班級:'},
    'Create Assignment': {'en': 'Create Assignment', 'zh-CN': '创建作业', 'zh-TW': '創建作業'},
    'Choose a class': {'en': 'Choose a class', 'zh-CN': '选择一个班级', 'zh-TW': '選擇一個班級'},
    'My Classes (Lead & Co-Teacher)': {'en': 'My Classes (Lead & Co-Teacher)', 'zh-CN': '我的班级 (主班和配班)', 'zh-TW': '我的班級 (主班和配班)'},
    'Other Classes': {'en': 'Other Classes', 'zh-CN': '其他班级', 'zh-TW': '其他班級'},
    'New Assignment': {'en': 'New Assignment', 'zh-CN': '新建作业', 'zh-TW': '新建作業'},
    'Edit Assignment': {'en': 'Edit Assignment', 'zh-CN': '编辑作业', 'zh-TW': '編輯作業'},
    'Create New Assignment': {'en': 'Create New Assignment', 'zh-CN': '创建新作业', 'zh-TW': '創建新作業'},
    
    # Announcements
    'Create and manage broadcast communications.': {'en': 'Create and manage broadcast communications.', 'zh-CN': '创建和管理广播通信。', 'zh-TW': '創建和管理廣播通訊。'},
    'Read the latest updates from your school.': {'en': 'Read the latest updates from your school.', 'zh-CN': '阅读学校的最新动态。', 'zh-TW': '閱讀學校的最新動態。'},
    'Targeted Roles': {'en': 'Targeted Roles', 'zh-CN': '目标角色', 'zh-TW': '目標角色'},
    'Targeted Classes': {'en': 'Targeted Classes', 'zh-CN': '目标班级', 'zh-TW': '目標班級'},
    'Targeted Users': {'en': 'Targeted Users', 'zh-CN': '目标用户', 'zh-TW': '目標用戶'},
    'All Audiences': {'en': 'All Audiences', 'zh-CN': '所有受众', 'zh-TW': '所有受眾'},
    'Search announcements...': {'en': 'Search announcements...', 'zh-CN': '搜索公告...', 'zh-TW': '搜尋公告...'},
}

# we need to remove the previously inserted block
# the block starts with "Room": { en: "Room", 'zh-CN': "教室", 'zh-TW': "教室" },
# and ends with "Search announcements...": { en: "Search announcements...", 'zh-CN': "搜索公告...", 'zh-TW': "搜尋公告..." },
match = re.search(r'  "Room":.*?Search announcements\.\.\." \},\n', content, re.DOTALL)
if match:
    content = content.replace(match.group(0), '')

# format them correctly
lines_to_add = []
for k, v in translations_to_add.items():
    safe_k = k.replace('"', '\\"')
    safe_en = v['en'].replace('"', '\\"')
    safe_cn = v['zh-CN'].replace('"', '\\"')
    safe_tw = v['zh-TW'].replace('"', '\\"')
    # make sure this key is not already in the content
    if f'"{safe_k}":' not in content:
        lines_to_add.append(f'  "{safe_k}": {{ en: "{safe_en}", \'zh-CN\': "{safe_cn}", \'zh-TW\': "{safe_tw}" }},')

block = "\n".join(lines_to_add)

# insert after `const translations: Translations = {`
target = "const translations: Translations = {"
if target in content:
    content = content.replace(target, target + "\n" + block)

with open('src/lib/i18n.tsx', 'w') as f:
    f.write(content)
