with open('src/pages/StudentAssignments.tsx', 'r') as f:
    text = f.read()

text = text.replace('import { supabase } from "../lib/supabase";', 'import { supabase } from "../lib/supabase";\nimport { useLanguage } from "../lib/i18n";')
text = text.replace('export default function StudentAssignments() {\n  const [activeTab, setActiveTab] = useState("all");', 'export default function StudentAssignments() {\n  const { t } = useLanguage();\n  const [activeTab, setActiveTab] = useState("all");')

text = text.replace(">Assignments</h1>", ">{t('Assignments')}</h1>")
text = text.replace(">Manage your homework and projects.</p>", ">{t('Manage your homework and projects.')}</p>")
text = text.replace(">All Assignments<", ">{t('All Assignments')}<")
text = text.replace(">To Do<", ">{t('To Do')}<")
text = text.replace(">Completed<", ">{t('Completed')}<")
text = text.replace(">All caught up!</p>", ">{t('All caught up!')}</p>")

with open('src/pages/StudentAssignments.tsx', 'w') as f:
    f.write(text)
