with open('src/pages/QRScanner.tsx', 'r') as f:
    text = f.read()

text = text.replace("        Scan QR codes to record daily building arrival for students, teachers, and staff.", "        {t('Scan QR codes to record daily building arrival for students, teachers, and staff.')}")

with open('src/pages/QRScanner.tsx', 'w') as f:
    f.write(text)
