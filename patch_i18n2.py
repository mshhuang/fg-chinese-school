import re

with open('src/lib/i18n.tsx', 'r') as f:
    content = f.read()

translations_to_add = {
    'Assignments': {'zh-CN': '作业', 'zh-TW': '作業'},
    'Manage homework and assignments for your classes.': {'zh-CN': '管理班级的作业和任务。', 'zh-TW': '管理班級的作業和任務。'},
    'Select Class:': {'zh-CN': '选择班级:', 'zh-TW': '選擇班級:'},
    'All Classes': {'zh-CN': '所有班级', 'zh-TW': '所有班級'},
    'Create Assignment': {'zh-CN': '创建作业', 'zh-TW': '創建作業'}
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

