import re

with open('src/lib/i18n.tsx', 'r') as f:
    content = f.read()

translations_to_add = {
    'Choose a class': {'zh-CN': '选择一个班级', 'zh-TW': '選擇一個班級'},
    'My Classes (Lead & Co-Teacher)': {'zh-CN': '我的班级 (主班和配班)', 'zh-TW': '我的班級 (主班和配班)'},
    'Other Classes': {'zh-CN': '其他班级', 'zh-TW': '其他班級'},
    'New Assignment': {'zh-CN': '新建作业', 'zh-TW': '新建作業'},
    'Cancel': {'zh-CN': '取消', 'zh-TW': '取消'},
    'Edit Assignment': {'zh-CN': '编辑作业', 'zh-TW': '編輯作業'},
    'Create New Assignment': {'zh-CN': '创建新作业', 'zh-TW': '創建新作業'},
    'Title': {'zh-CN': '标题', 'zh-TW': '標題'}
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

