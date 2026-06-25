const fs = require('fs');
let code = fs.readFileSync('src/pages/TeacherAssignments.tsx', 'utf8');

code = code.replace(
  "const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');",
  "const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');\n  const [expandedAssignId, setExpandedAssignId] = useState<number | null>(null);"
);

const expandToggleCode = `                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <div className="flex items-center gap-1.5 text-on-surface-variant font-label">
                      <Calendar className="w-4 h-4" />
                      {a.due_date ? new Date(a.due_date).toLocaleString() : 'No due date'}
                    </div>
                    <button 
                      onClick={() => setExpandedAssignId(expandedAssignId === a.assignment_id ? null : a.assignment_id)}
                      className="flex items-center gap-1.5 text-primary hover:underline font-label cursor-pointer"
                    >
                      <Users className="w-4 h-4" />
                      {a.assignment_students?.length || 0} assigned
                    </button>
                  </div>
                  
                  {expandedAssignId === a.assignment_id && (
                     <div className="mt-4 pt-4 border-t border-outline-variant/30 flex flex-col gap-2">
                        <h4 className="font-label font-bold text-on-surface text-sm mb-1">Student Status</h4>
                        {(a.assignment_students || []).map((as: any) => {
                           const student = students.find(s => s.user_id === as.student_id);
                           const isSubmitted = as.status === 'submitted' || as.status === 'completed';
                           return (
                              <div key={as.assignment_student_id} className="flex items-center justify-between bg-surface-container py-2 px-3 rounded-lg border border-outline-variant/20">
                                 <span className="font-body text-sm text-on-surface">{student ? \`\${student.first_name} \${student.last_name}\` : 'Unknown Student'}</span>
                                 <span className={\`font-label font-bold text-xs px-2 py-0.5 rounded-full \${isSubmitted ? 'bg-primary-container text-on-primary-container' : 'bg-surface-variant text-on-surface-variant'}\`}>
                                    {isSubmitted ? 'Submitted' : 'Pending'}
                                 </span>
                              </div>
                           );
                        })}
                        {(a.assignment_students || []).length === 0 && (
                           <p className="text-sm font-body text-on-surface-variant italic">No students assigned.</p>
                        )}
                     </div>
                  )}
`;

const replaceCode = `                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <div className="flex items-center gap-1.5 text-on-surface-variant font-label">
                      <Calendar className="w-4 h-4" />
                      {a.due_date ? new Date(a.due_date).toLocaleString() : 'No due date'}
                    </div>
                    <div className="flex items-center gap-1.5 text-on-surface-variant font-label">
                      <Users className="w-4 h-4" />
                      {a.assignment_students?.length || 0} assigned
                    </div>
                  </div>`;

code = code.replace(replaceCode, expandToggleCode);

fs.writeFileSync('src/pages/TeacherAssignments.tsx', code);
