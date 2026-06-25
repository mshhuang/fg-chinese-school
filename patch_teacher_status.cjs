const fs = require('fs');
let code = fs.readFileSync('src/pages/TeacherAssignments.tsx', 'utf8');

const handleDeleteCode = `  const handleDelete = async (id: number) => {
    await supabase.from('assignments').delete().eq('assignment_id', id);
    fetchAssignments(selectedClassId);
    setAssignmentToDelete(null);
  };`;

const newHandleStatusCode = `  const handleDelete = async (id: number) => {
    await supabase.from('assignments').delete().eq('assignment_id', id);
    fetchAssignments(selectedClassId);
    setAssignmentToDelete(null);
  };

  const handleUpdateStudentStatus = async (assignmentStudentId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    await supabase.from('assignment_students').update({ status: newStatus }).eq('assignment_student_id', assignmentStudentId);
    fetchAssignments(selectedClassId);
  };`;

code = code.replace(handleDeleteCode, newHandleStatusCode);

const oldStudentStatusUI = `<span className={\`font-label font-bold text-xs px-2 py-0.5 rounded-full \${isSubmitted ? 'bg-primary-container text-on-primary-container' : 'bg-surface-variant text-on-surface-variant'}\`}>
                                    {isSubmitted ? 'Submitted' : 'Pending'}
                                 </span>`;

const newStudentStatusUI = `<div className="flex items-center gap-2">
                                    <span className={\`font-label font-bold text-xs px-2 py-0.5 rounded-full \${isSubmitted ? 'bg-primary-container text-on-primary-container' : 'bg-surface-variant text-on-surface-variant'}\`}>
                                       {as.status === 'completed' ? 'Completed' : as.status === 'submitted' ? 'Submitted' : 'Pending'}
                                    </span>
                                    <button 
                                      onClick={() => handleUpdateStudentStatus(as.assignment_student_id, as.status)}
                                      className="p-1.5 hover:bg-surface-variant text-on-surface-variant rounded-full transition-colors"
                                      title={as.status === 'pending' ? 'Mark as Completed' : 'Mark as Pending'}
                                    >
                                      {as.status === 'pending' ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <XCircle className="w-4 h-4 text-error" />}
                                    </button>
                                 </div>`;

code = code.replace(oldStudentStatusUI, newStudentStatusUI);

fs.writeFileSync('src/pages/TeacherAssignments.tsx', code);
