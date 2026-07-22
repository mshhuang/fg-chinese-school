const fs = require('fs');
let content = fs.readFileSync('src/pages/TeacherAssignmentBoard.tsx', 'utf8');

content = content.replace('const [assignmentToDelete, setAssignmentToDelete] = useState<number | null>(null);', 
`const [assignmentToDelete, setAssignmentToDelete] = useState<number | null>(null);
  const [viewingSubmission, setViewingSubmission] = useState<{ studentName: string, text: string, attachments: any[], assignmentTitle: string } | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);`);

fs.writeFileSync('src/pages/TeacherAssignmentBoard.tsx', content);
