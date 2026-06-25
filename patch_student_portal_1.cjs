const fs = require('fs');
let code = fs.readFileSync('src/pages/StudentPortal.tsx', 'utf8');

const replacements = [];

// Imports
code = code.replace(
  'import { BookOpen, Check, Volume2, Star, Edit3, Lock, ChevronRight, Megaphone, Users } from "lucide-react";',
  'import { BookOpen, Check, Volume2, Star, Edit3, Lock, ChevronRight, Megaphone, Users, Circle } from "lucide-react";'
);

// State definitions
code = code.replace(
  'const [parents, setParents] = useState<any[]>([]);',
  `const [parents, setParents] = useState<any[]>([]);
  const [announcement, setAnnouncement] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);`
);

// Fetching logic
const oldFetchData = `          if (user && user.id && user.id !== 'demo') {
            const { data } = await supabase
              .from('parent_child')
              .select(\`
                parent_id,
                relationship_type,
                users:parent_id (
                  first_name,
                  last_name
                )
              \`)
              .eq('child_id', user.id) as any;
            if (data) {
                const parentsData = data.map((d: any) => ({
                    ...d.users,
                    relationship_type: d.relationship_type
                })).filter((u: any) => u && u.first_name);
                setParents(parentsData);
            }
          }`;

const newFetchData = `          if (user && user.id && user.id !== 'demo') {
            const { data } = await supabase
              .from('parent_child')
              .select(\`
                parent_id,
                relationship_type,
                users:parent_id (
                  first_name,
                  last_name
                )
              \`)
              .eq('child_id', user.id) as any;
            if (data) {
                const parentsData = data.map((d: any) => ({
                    ...d.users,
                    relationship_type: d.relationship_type
                })).filter((u: any) => u && u.first_name);
                setParents(parentsData);
            }

            // Fetch latest announcement
            const { data: annData } = await supabase
              .from('announcements')
              .select('*')
              .order('created_at', { ascending: false })
              .limit(1)
              .single();
            if (annData) setAnnouncement(annData);

            // Fetch assignments
            const { data: assignData } = await supabase
              .from('assignment_students')
              .select(\`
                assignment_student_id,
                status,
                assignments (
                   title, type, due_date, description,
                   classes ( class_name )
                )
              \`)
              .eq('student_id', user.id);
            if (assignData) {
               const pending = assignData.filter((a: any) => a.status === 'pending');
               setAssignments(pending);
            }

            // Fetch classes
            const { data: enrollData } = await supabase
              .from('enrollments')
              .select(\`
                 classes (
                    class_id, class_name
                 )
              \`)
              .eq('student_id', user.id);
            if (enrollData) {
               setClasses(enrollData.map((e: any) => e.classes).filter(Boolean));
            }
          }`;
code = code.replace(oldFetchData, newFetchData);

fs.writeFileSync('src/pages/StudentPortal.tsx', code);
