const fs = require('fs');
let content = fs.readFileSync('src/pages/TeacherAssignmentBoard.tsx', 'utf8');

content = content.replace(
  "import { BookOpen, Plus, Save, X, Edit, Trash2, Calendar, FileText, CheckCircle2, Circle, Users, XCircle } from 'lucide-react';",
  "import { BookOpen, Plus, Save, X, Edit, Trash2, Calendar, FileText, CheckCircle2, Circle, Users, XCircle, Search, Image as ImageIcon } from 'lucide-react';"
);

content = content.replace(/<Image className=/g, '<ImageIcon className=');

fs.writeFileSync('src/pages/TeacherAssignmentBoard.tsx', content);
