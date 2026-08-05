with open('src/lib/i18n.tsx', 'r') as f:
    text = f.read()

new_translations = """  "Start Camera": { en: "Start Camera", 'zh-CN': "开启相机", 'zh-TW': "開啟相機" },
  "Upload QR Image": { en: "Upload QR Image", 'zh-CN': "上传二维码图片", 'zh-TW': "上傳二維碼圖片" },
"""

text = text.replace('const translations: Translations = {', 'const translations: Translations = {\n' + new_translations)

with open('src/lib/i18n.tsx', 'w') as f:
    f.write(text)
