import re

with open('src/components/DuplicateClockWarningModal.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "import React, { useState, useEffect } from 'react';",
    "import React, { useState, useEffect } from 'react';\nimport { useLanguage } from '../lib/i18n';"
)

content = content.replace(
    '  onDelete?: () => Promise<void>;\n}\n\nexport const DuplicateClockWarningModal: React.FC<DuplicateClockWarningModalProps> = ({\n  isOpen,',
    '  onDelete?: () => Promise<void>;\n}\n\nexport const DuplicateClockWarningModal: React.FC<DuplicateClockWarningModalProps> = ({\n  isOpen,'
)

content = re.sub(
    r'(export const DuplicateClockWarningModal: React\.FC<DuplicateClockWarningModalProps> = \(\{.*?\}\) => \{)',
    r'\1\n  const { t } = useLanguage();',
    content,
    flags=re.DOTALL
)

with open('src/components/DuplicateClockWarningModal.tsx', 'w') as f:
    f.write(content)
