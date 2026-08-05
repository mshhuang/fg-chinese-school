with open('src/pages/QRScanner.tsx', 'r') as f:
    text = f.read()

text = text.replace('Start Camera', "{t('Start Camera')}")
text = text.replace('Upload QR Image', "{t('Upload QR Image')}")

with open('src/pages/QRScanner.tsx', 'w') as f:
    f.write(text)
