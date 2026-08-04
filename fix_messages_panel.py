import re

with open('src/components/InternalMessagesPanel.tsx', 'r') as f:
    content = f.read()

# Add import
content = content.replace('import { supabase } from "../lib/supabase";', 'import { supabase } from "../lib/supabase";\nimport { useLanguage } from "../lib/i18n";')

# Add useLanguage hook
content = content.replace('export function InternalMessagesPanel() {', 'export function InternalMessagesPanel() {\n  const { t } = useLanguage();')

# Replace strings with t()
replacements = {
    'placeholder="Search recent chats..."': 'placeholder={t("Search recent chats...")}',
    'No conversations found': '{t("No conversations found")}',
    'Search for users above to start a new conversation.': '{t("Search for users above to start a new conversation.")}',
    'Compose Message': '{t("Compose Message")}',
    'Select a user below to start a conversation': '{t("Select a user below to start a conversation")}',
    '>Select Recipient<': '>{t("Select Recipient")}<',
    '>Select a user<': '>{t("Select a user")}<'
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open('src/components/InternalMessagesPanel.tsx', 'w') as f:
    f.write(content)

print("Updated InternalMessagesPanel.tsx")
