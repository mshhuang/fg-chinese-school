with open('src/pages/QRScanner.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    r'{!scannedUser.isStaff && <button onClick={() => setIsOverriding(true)} className=\"py-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors\">Manual Override / Edit Status</button>}',
    r'{!scannedUser.isStaff && <button onClick={() => setIsOverriding(true)} className="py-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors">Manual Override / Edit Status</button>}'
)

with open('src/pages/QRScanner.tsx', 'w') as f:
    f.write(content)
print("QR Scanner handle override fixed!")
