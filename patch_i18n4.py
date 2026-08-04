import re

with open('src/lib/i18n.tsx', 'r') as f:
    content = f.read()

translations_to_add = {
    'Create and manage broadcast communications.': {'zh-CN': '创建和管理广播通信。', 'zh-TW': '創建和管理廣播通訊。'},
    'Read the latest updates from your school.': {'zh-CN': '阅读学校的最新动态。', 'zh-TW': '閱讀學校的最新動態。'},
    'New Announcement': {'zh-CN': '新公告', 'zh-TW': '新公告'},
    'Search announcements...': {'zh-CN': '搜索公告...', 'zh-TW': '搜尋公告...'},
    'All': {'zh-CN': '全部', 'zh-TW': '全部'},
    'Targeted Roles': {'zh-CN': '目标角色', 'zh-TW': '目標角色'},
    'Targeted Classes': {'zh-CN': '目标班级', 'zh-TW': '目標班級'},
    'Targeted Users': {'zh-CN': '目标用户', 'zh-TW': '目標用戶'},
    'All Audiences': {'zh-CN': '所有受众', 'zh-TW': '所有受眾'},
    'Announcements': {'zh-CN': '公告', 'zh-TW': '公告'}
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

