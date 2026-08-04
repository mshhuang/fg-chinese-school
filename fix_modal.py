import re
with open('src/components/DuplicateClockWarningModal.tsx', 'r') as f:
    content = f.read()

content = content.replace('import { X, Clock, AlertTriangle } from "lucide-react";', 'import { X, Clock, AlertTriangle } from "lucide-react";\nimport { useLanguage } from "../lib/i18n";')
content = content.replace('export function DuplicateClockWarningModal({', 'export function DuplicateClockWarningModal({\n  // Add t inside the function\n')

# Actually we can just do:
content = re.sub(
    r'(export function DuplicateClockWarningModal\(\{(.*?)\}: DuplicateClockWarningModalProps\) \{)',
    r'\1\n  const { t } = useLanguage();',
    content,
    flags=re.DOTALL
)

content = content.replace("? 'Clock In' : (actionType === 'school_check_out' ? 'Ready to Go Home' : 'Clock Out')", '? t("Clock In") : (actionType === "school_check_out" ? t("Ready to Go Home") : t("Clock Out"))')

with open('src/components/DuplicateClockWarningModal.tsx', 'w') as f:
    f.write(content)
