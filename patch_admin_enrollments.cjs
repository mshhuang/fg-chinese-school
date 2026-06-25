const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminEnrollments.tsx', 'utf8');

// 1. Add confirm state
code = code.replace(
  "const [searchTerm, setSearchTerm] = useState('');",
  "const [searchTerm, setSearchTerm] = useState('');\n  const [confirmDeleteId, setConfirmDeleteId] = useState<any>(null);"
);

// 2. Update handleDelete
code = code.replace(
  `const handleDelete = async (id: number) => {
    if(!confirm("Are you sure you want to delete this enrollment?")) return; console.log("deleting", id);
    await supabase.from('enrollments').delete().eq('enrollment_id', id);
    fetchData();
  };`,
  `const handleDelete = async (id: number, confirmed: boolean = false) => {
    if(!confirmed) return;
    await supabase.from('enrollments').delete().eq('enrollment_id', id);
    setConfirmDeleteId(null);
    fetchData();
  };`
);

// 3. Update UI
code = code.replace(
  `<button onClick={() => handleDelete(enr.enrollment_id)} className="w-8 h-8 rounded-full inline-flex flex items-center justify-center text-on-surface-variant hover:bg-error-container hover:text-error transition-colors">
                           <Trash2 className="w-4 h-4" />
                         </button>`,
  `{confirmDeleteId === enr.enrollment_id ? (
                            <div className="flex items-center gap-1 bg-error-container/20 px-1 py-0.5 rounded-full">
                                <button onClick={() => setConfirmDeleteId(null)} className="text-[10px] font-bold text-on-surface-variant hover:text-on-surface px-1">Cancel</button>
                                <button onClick={() => handleDelete(enr.enrollment_id, true)} className="text-[10px] font-bold text-error hover:underline px-1">Del</button>
                            </div>
                         ) : (
                         <button onClick={() => setConfirmDeleteId(enr.enrollment_id)} className="w-8 h-8 rounded-full inline-flex flex items-center justify-center text-on-surface-variant hover:bg-error-container hover:text-error transition-colors">
                           <Trash2 className="w-4 h-4" />
                         </button>
                         )}`
);

fs.writeFileSync('src/pages/AdminEnrollments.tsx', code);
