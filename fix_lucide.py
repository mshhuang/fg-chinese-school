import re

with open('src/pages/Announcements.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'import { Settings, Megaphone, Search, Filter, Plus, Clock, Users, Reply, X, Loader2, MessageSquare, Send, BookOpen, GraduationCap, User, Home, Briefcase, Heart, Wrench, Sparkles, Edit2, Trash2, Paperclip, ChevronDown, ChevronUp } from "lucide-react";',
    'import { Settings, Megaphone, Search, Filter, Plus, Clock, Users, Reply, X, Loader2, MessageSquare, Send, BookOpen, GraduationCap, User, Home, Briefcase, Heart, Wrench, Sparkles, Edit2, Trash2, Paperclip, ChevronDown, ChevronUp, UserSquare2, Check } from "lucide-react";'
)

with open('src/pages/Announcements.tsx', 'w') as f:
    f.write(content)
