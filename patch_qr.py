with open('src/pages/QRScanner.tsx', 'r') as f:
    text = f.read()

text = text.replace('import { supabase } from "../lib/supabase";', 'import { supabase } from "../lib/supabase";\nimport { useLanguage } from "../lib/i18n";')
text = text.replace('export default function QRScanner() {\n  const [scanResult, setScanResult] = useState<string | null>(null);', 'export default function QRScanner() {\n  const { t } = useLanguage();\n  const [scanResult, setScanResult] = useState<string | null>(null);')

text = text.replace(">School Check-in Scanner</h1>", ">{t('School Check-in Scanner')}</h1>")
text = text.replace(">Scan QR codes to record daily building arrival for students, teachers, and staff.</p>", ">{t('Scan QR codes to record daily building arrival for students, teachers, and staff.')}</p>")

with open('src/pages/QRScanner.tsx', 'w') as f:
    f.write(text)
