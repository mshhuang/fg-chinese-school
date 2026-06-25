const fs = require('fs');
let code = fs.readFileSync('src/pages/TeacherAssignments.tsx', 'utf8');

code = code.replace(
  "const [expandedAssignId, setExpandedAssignId] = useState<number | null>(null);",
  "const [expandedAssignId, setExpandedAssignId] = useState<number | null>(null);\n  const [assignmentToDelete, setAssignmentToDelete] = useState<number | null>(null);"
);

code = code.replace(
  `  const handleDelete = async (id: number) => {
    if (!confirm("Delete this assignment?")) return;
    await supabase.from('assignments').delete().eq('assignment_id', id);
    fetchAssignments(selectedClassId);
  };`,
  `  const handleDelete = async (id: number) => {
    await supabase.from('assignments').delete().eq('assignment_id', id);
    fetchAssignments(selectedClassId);
    setAssignmentToDelete(null);
  };`
);

code = code.replace(
  `onClick={() => handleDelete(a.assignment_id)} className="p-2 text-on-surface-variant hover:bg-error-container hover:text-error rounded-xl transition-colors" title="Delete"`,
  `onClick={() => setAssignmentToDelete(a.assignment_id)} className="p-2 text-on-surface-variant hover:bg-error-container hover:text-error rounded-xl transition-colors" title="Delete"`
);

// Add the modal at the end of the return statement
const modalCode = `
      {assignmentToDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-xl flex flex-col">
              <h2 className="text-xl font-display font-bold text-on-surface mb-2">Delete Assignment?</h2>
              <p className="text-on-surface-variant font-body mb-6">This action cannot be undone. All student submissions will also be deleted.</p>
              <div className="flex gap-3 justify-end">
                 <button onClick={() => setAssignmentToDelete(null)} className="px-4 py-2 font-label font-bold text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors">Cancel</button>
                 <button onClick={() => handleDelete(assignmentToDelete)} className="px-4 py-2 font-label font-bold bg-error text-on-error hover:bg-error/90 rounded-full transition-colors">Delete</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
`;

code = code.replace(
  "    </div>\n  );\n}",
  modalCode
);

fs.writeFileSync('src/pages/TeacherAssignments.tsx', code);
