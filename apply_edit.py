import re

with open('src/pages/Announcements.tsx', 'r') as f:
    content = f.read()
    
with open('target.txt', 'r') as f:
    target = f.read()
    
with open('target_new.txt', 'r') as f:
    target_new = f.read()

# Replace the block
content = content.replace(target, target_new)

# Replace imports
content = content.replace(
    'import { Settings, Megaphone, Search, Filter, Plus, Clock, Users, Reply, X, Loader2, MessageSquare, Send, BookOpen, GraduationCap, User, Home, Briefcase, Heart, Wrench, Sparkles, Edit2, Trash2, Paperclip } from "lucide-react";\nimport { cn, formatTeacherName } from "../lib/utils";',
    'import { Settings, Megaphone, Search, Filter, Plus, Clock, Users, Reply, X, Loader2, MessageSquare, Send, BookOpen, GraduationCap, User, Home, Briefcase, Heart, Wrench, Sparkles, Edit2, Trash2, Paperclip, ChevronDown, ChevronUp } from "lucide-react";\nimport { cn, formatTeacherName } from "../lib/utils";'
)

# Add state
content = content.replace(
    '  // Edit/Delete State\n  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);',
    '  // Accordion State\n  const [expandedAnns, setExpandedAnns] = useState<Record<string, boolean>>({});\n\n  const toggleAccordion = (id: string, replies: any[]) => {\n      setExpandedAnns(prev => ({ ...prev, [id]: !prev[id] }));\n      markAsRead(id, replies);\n  };\n\n  // Edit/Delete State\n  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);'
)

with open('src/pages/Announcements.tsx', 'w') as f:
    f.write(content)
