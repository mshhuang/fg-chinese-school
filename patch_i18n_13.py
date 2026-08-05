with open('src/lib/i18n.tsx', 'r') as f:
    text = f.read()

new_translations = """  "Title": { en: "Title", 'zh-CN': "标题", 'zh-TW': "標題" },
  "Target Audience": { en: "Target Audience", 'zh-CN': "目标受众", 'zh-TW': "目標受眾" },
  "Brief Context (Optional)": { en: "Brief Context (Optional)", 'zh-CN': "简短的背景信息（可选）", 'zh-TW': "簡短的背景資訊（可選）" },
  "Attachments": { en: "Attachments", 'zh-CN': "附件", 'zh-TW': "附件" },
  "Click to attach files": { en: "Click to attach files", 'zh-CN': "点击添加附件", 'zh-TW': "點擊添加附件" },
  "Supported: PDF, Word, Text, Images, HEIC (Max 10MB each)": { en: "Supported: PDF, Word, Text, Images, HEIC (Max 10MB each)", 'zh-CN': "支持的格式：PDF、Word、文本、图像、HEIC（每个最大 10MB）", 'zh-TW': "支援的格式：PDF、Word、文字、圖像、HEIC（每個最大 10MB）" },
  "Save as Draft": { en: "Save as Draft", 'zh-CN': "保存为草稿", 'zh-TW': "儲存為草稿" },
  "Submit for Approval": { en: "Submit for Approval", 'zh-CN': "提交以供批准", 'zh-TW': "提交以供批准" },
  "Saving...": { en: "Saving...", 'zh-CN': "保存中...", 'zh-TW': "儲存中..." },
"""
text = text.replace('const translations: Translations = {', 'const translations: Translations = {\\n' + new_translations)

with open('src/lib/i18n.tsx', 'w') as f:
    f.write(text)
