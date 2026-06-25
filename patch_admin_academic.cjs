const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminAcademic.tsx', 'utf8');

// 1. Add confirm state
code = code.replace(
  "const [editingId, setEditingId] = useState<string | number | null>(null);",
  "const [editingId, setEditingId] = useState<string | number | null>(null);\n  const [confirmDeleteId, setConfirmDeleteId] = useState<any>(null);"
);

// 2. Update handleDelete
code = code.replace(
  `async function handleDelete(id: any) {
    if (!confirm("Are you sure?")) return;
    let table = activeTab;
    let idField = activeTab === 'programs' ? 'program_id' : 
                  activeTab === 'classes' ? 'class_id' : 
                  activeTab === 'subjects' ? 'subject_id' : 
                  activeTab === 'periods' ? 'period_id' : 'room_id';
    
    await supabase.from(table).delete().eq(idField, id);
    fetchData();
  }`,
  `async function handleDelete(id: any, confirmed: boolean = false) {
    if (!confirmed) return;
    let table = activeTab;
    let idField = activeTab === 'programs' ? 'program_id' : 
                  activeTab === 'classes' ? 'class_id' : 
                  activeTab === 'subjects' ? 'subject_id' : 
                  activeTab === 'periods' ? 'period_id' : 'room_id';
    
    await supabase.from(table).delete().eq(idField, id);
    setConfirmDeleteId(null);
    fetchData();
  }`
);

// 3. Update UI
// Looking for `onClick={() => handleDelete(row.program_id || row.class_id || row.subject_id || row.period_id || row.room_id)}`
code = code.replace(
  `<button onClick={() => handleDelete(row.program_id || row.class_id || row.subject_id || row.period_id || row.room_id)} className="w-8 h-8 rounded-full inline-flex flex items-center justify-center text-on-surface-variant hover:bg-error-container hover:text-error transition-colors">
                           <Trash2 className="w-4 h-4" />
                        </button>`,
  `{confirmDeleteId === (row.program_id || row.class_id || row.subject_id || row.period_id || row.room_id) ? (
                            <div className="flex items-center gap-1 bg-error-container/20 px-1 py-0.5 rounded-full">
                                <button onClick={() => setConfirmDeleteId(null)} className="text-[10px] font-bold text-on-surface-variant hover:text-on-surface px-1">Cancel</button>
                                <button onClick={() => handleDelete(row.program_id || row.class_id || row.subject_id || row.period_id || row.room_id, true)} className="text-[10px] font-bold text-error hover:underline px-1">Del</button>
                            </div>
                        ) : (
                        <button onClick={() => setConfirmDeleteId(row.program_id || row.class_id || row.subject_id || row.period_id || row.room_id)} className="w-8 h-8 rounded-full inline-flex flex items-center justify-center text-on-surface-variant hover:bg-error-container hover:text-error transition-colors">
                           <Trash2 className="w-4 h-4" />
                        </button>
                        )}`
);

fs.writeFileSync('src/pages/AdminAcademic.tsx', code);
