with open('src/lib/i18n.tsx', 'r') as f:
    text = f.read()

new_translations = """  "Sharing Instructions": { en: "Sharing Instructions", 'zh-CN': "分享说明", 'zh-TW': "分享說明" },
  "Open your Google Doc or Slide.": { en: "Open your Google Doc or Slide.", 'zh-CN': "打开您的 Google 文档或幻灯片。", 'zh-TW': "打開您的 Google 文件或幻燈片。" },
  "step_2": { en: "Click the blue <strong>Share</strong> button in the top right.", 'zh-CN': "点击右上角蓝色的<strong>分享</strong>按钮。", 'zh-TW': "點擊右上角藍色的<strong>分享</strong>按鈕。" },
  "step_3": { en: "Under \\"General access\\", change Restricted to <strong>Anyone with the link</strong>.", 'zh-CN': "在“常规访问权限”下，将“受限”更改为<strong>任何知道链接的人</strong>。", 'zh-TW': "在「一般存取權」下，將「受限」更改為<strong>知道連結的任何人</strong>。" },
  "step_4": { en: "Ensure the role on the right is set to <strong>Viewer</strong>.", 'zh-CN': "确保右侧的角色设置为<strong>查看者</strong>。", 'zh-TW': "確保右側的角色設置為<strong>檢視者</strong>。" },
  "step_5": { en: "Click <strong>Copy link</strong> and paste it into the field below.", 'zh-CN': "点击<strong>复制链接</strong>并将其粘贴到下方的输入框中。", 'zh-TW': "點擊<strong>複製連結</strong>並將其貼上到下方的輸入框中。" },
"""
text = text.replace('const translations: Translations = {', 'const translations: Translations = {\n' + new_translations)

with open('src/lib/i18n.tsx', 'w') as f:
    f.write(text)
