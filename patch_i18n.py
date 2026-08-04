import re

with open('src/lib/i18n.tsx', 'r') as f:
    content = f.read()

translations_to_add = {
    'Room': {'zh-CN': '教室', 'zh-TW': '教室'},
    'TBD': {'zh-CN': '待定', 'zh-TW': '待定'},
    'Students': {'zh-CN': '名学生', 'zh-TW': '名學生'},
    'Teaching Team': {'zh-CN': '教学团队', 'zh-TW': '教學團隊'},
    'Lead:': {'zh-CN': '主班老师:', 'zh-TW': '主班老師:'},
    'Co-teacher:': {'zh-CN': '配班老师:', 'zh-TW': '配班老師:'},
    'Management Tools': {'zh-CN': '管理工具', 'zh-TW': '管理工具'},
    'Attendance': {'zh-CN': '出勤', 'zh-TW': '出勤'},
    'Track & view sheets': {'zh-CN': '跟踪和查看记录', 'zh-TW': '追蹤和查看記錄'},
    'Assignments': {'zh-CN': '作业', 'zh-TW': '作業'},
    'Manage tasks': {'zh-CN': '管理任务', 'zh-TW': '管理任務'},
    'Class Notes': {'zh-CN': '课堂笔记', 'zh-TW': '課堂筆記'},
    'Observations': {'zh-CN': '观察记录', 'zh-TW': '觀察記錄'},
    'Performance': {'zh-CN': '表现', 'zh-TW': '表現'},
    'Class metrics': {'zh-CN': '班级指标', 'zh-TW': '班級指標'},
    'Student Roster': {'zh-CN': '学生名单', 'zh-TW': '學生名單'},
    'Search students...': {'zh-CN': '搜索学生...', 'zh-TW': '搜尋學生...'},
    'Load More Students': {'zh-CN': '加载更多学生', 'zh-TW': '載入更多學生'},
    'Present (In School)': {'zh-CN': '出勤 (在校)', 'zh-TW': '出勤 (在校)'},
    'Checked Out (Left School)': {'zh-CN': '已签退 (离校)', 'zh-TW': '已簽退 (離校)'},
    'Absent': {'zh-CN': '缺勤', 'zh-TW': '缺勤'},
    'Not Arrived': {'zh-CN': '未到', 'zh-TW': '未到'},
    'Late': {'zh-CN': '迟到', 'zh-TW': '遲到'},
    'Excused': {'zh-CN': '请假', 'zh-TW': '請假'},
    'arrived_at': {'en': '{name} arrived at school at {time} on {date}', 'zh-CN': '{name} 在 {date} {time} 到校', 'zh-TW': '{name} 在 {date} {time} 到校'},
    'No Classes Assigned': {'zh-CN': '未分配班级', 'zh-TW': '未分配班級'},
    'no_classes_assigned_desc': {'en': 'You are not currently assigned as a primary or co-teacher for any classes. If you believe this is an error, please contact the administration.', 'zh-CN': '您目前未被指定为任何班级的主班或配班老师。如果您认为这是一个错误，请联系管理部门。', 'zh-TW': '您目前未被指定為任何班級的主班或配班老師。如果您認為這是一個錯誤，請聯絡管理部門。'},
    'You': {'zh-CN': '你', 'zh-TW': '你'},
}

def insert_translation(lang_content, lang_code):
    lines = lang_content.split('\n')
    out = []
    for line in lines:
        out.append(line)
        if line.strip().startswith("'Announcements':"):
            for k, v in translations_to_add.items():
                if lang_code in v:
                    val = v[lang_code].replace("'", "\\'")
                    out.append(f"    '{k}': '{val}',")
                elif 'en' not in v:
                    # use key as english fallback
                    pass
    return '\n'.join(out)


# split by languages
zh_cn_match = re.search(r"'zh-CN':\s*\{.*?\n  \},", content, re.DOTALL)
zh_tw_match = re.search(r"'zh-TW':\s*\{.*?\n  \}", content, re.DOTALL)

if zh_cn_match:
    zh_cn_str = zh_cn_match.group(0)
    new_zh_cn_str = insert_translation(zh_cn_str, 'zh-CN')
    content = content.replace(zh_cn_str, new_zh_cn_str)

if zh_tw_match:
    zh_tw_str = zh_tw_match.group(0)
    new_zh_tw_str = insert_translation(zh_tw_str, 'zh-TW')
    content = content.replace(zh_tw_str, new_zh_tw_str)
    
# for EN, only those with specific en values:
en_match = re.search(r"'en':\s*\{.*?\n  \},", content, re.DOTALL)
if en_match:
    en_str = en_match.group(0)
    lines = en_str.split('\n')
    out = []
    for line in lines:
        out.append(line)
        if line.strip().startswith("'Announcements':"):
            for k, v in translations_to_add.items():
                if 'en' in v:
                    val = v['en'].replace("'", "\\'")
                    out.append(f"    '{k}': '{val}',")
    new_en_str = '\n'.join(out)
    content = content.replace(en_str, new_en_str)

with open('src/lib/i18n.tsx', 'w') as f:
    f.write(content)

