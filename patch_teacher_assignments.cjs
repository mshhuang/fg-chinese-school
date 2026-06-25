const fs = require('fs');
let code = fs.readFileSync('src/pages/TeacherAssignments.tsx', 'utf8');

// 1. Add state for editingId
code = code.replace(
  "const [showAdd, setShowAdd] = useState(false);",
  "const [showAdd, setShowAdd] = useState(false);\n  const [editingId, setEditingId] = useState<number | null>(null);"
);

// 2. Modify "New Assignment" button to clear editingId
code = code.replace(
  "onClick={() => setShowAdd(!showAdd)}",
  "onClick={() => { setShowAdd(!showAdd); setEditingId(null); setFormData({title: '', description: '', due_date: '', type: 'Writing'}); setSelectedStudents([]); }}"
);

// 3. Add Edit and Delete buttons to assignment card (and replace Delete with Edit/Delete group)
code = code.replace(
  /<button onClick=\{\(\) => handleDelete\(a.assignment_id\)\}.*?<\/button>/s,
  `<div className="flex items-center gap-2">
                      <button onClick={() => {
                        setEditingId(a.assignment_id);
                        setFormData({
                          title: a.title,
                          description: a.description || '',
                          due_date: a.due_date ? new Date(a.due_date).toISOString().slice(0,16) : '',
                          type: a.type
                        });
                        setSelectedStudents((a.assignment_students || []).map((as: any) => as.student_id));
                        setShowAdd(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }} className="p-2 text-on-surface-variant hover:bg-surface-variant hover:text-primary rounded-xl transition-colors" title="Edit">
                        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                      </button>
                      <button onClick={() => handleDelete(a.assignment_id)} className="p-2 text-on-surface-variant hover:bg-error-container hover:text-error rounded-xl transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>`
);

// 4. Update handleSubmit for edit case
code = code.replace(
  `// Create assignment
      const { data: assignData, error: assignError } = await supabase
        .from('assignments')
        .insert({
          class_id: selectedClassId,
          teacher_id: user.id,
          title: formData.title,
          description: formData.description,
          due_date: formData.due_date || null,
          type: formData.type
        })
        .select()
        .single();
        
      if (assignError) throw assignError;
      
      if (assignData) {
        // Create assignment_students records
        const studentInserts = selectedStudents.map(studentId => ({
          assignment_id: assignData.assignment_id,
          student_id: studentId,
          status: 'pending'
        }));
        
        const { error: studentError } = await supabase.from('assignment_students').insert(studentInserts);
        if (studentError) throw studentError;`,
  `let assignId = editingId;
      if (editingId) {
        const { error: updateError } = await supabase
          .from('assignments')
          .update({
            title: formData.title,
            description: formData.description,
            due_date: formData.due_date || null,
            type: formData.type
          })
          .eq('assignment_id', editingId);
        if (updateError) throw updateError;
        
        // delete old students
        await supabase.from('assignment_students').delete().eq('assignment_id', editingId);
      } else {
        const { data: assignData, error: assignError } = await supabase
          .from('assignments')
          .insert({
            class_id: selectedClassId,
            teacher_id: user.id,
            title: formData.title,
            description: formData.description,
            due_date: formData.due_date || null,
            type: formData.type
          })
          .select()
          .single();
        if (assignError) throw assignError;
        assignId = assignData.assignment_id;
      }
      
      if (assignId) {
        // Create assignment_students records
        const studentInserts = selectedStudents.map(studentId => ({
          assignment_id: assignId,
          student_id: studentId,
          status: 'pending'
        }));
        
        const { error: studentError } = await supabase.from('assignment_students').insert(studentInserts);
        if (studentError) throw studentError;`
);

// 5. Update form title
code = code.replace(
  `<h2 className="font-title text-xl font-bold text-on-surface">Create New Assignment</h2>`,
  `<h2 className="font-title text-xl font-bold text-on-surface">{editingId ? 'Edit Assignment' : 'Create New Assignment'}</h2>`
);

// 6. Fix "Cancel" button to clear editingId
code = code.replace(
  `<button type="button" onClick={() => setShowAdd(false)}`,
  `<button type="button" onClick={() => { setShowAdd(false); setEditingId(null); setFormData({title: '', description: '', due_date: '', type: 'Writing'}); setSelectedStudents([]); }}`
);


fs.writeFileSync('src/pages/TeacherAssignments.tsx', code);
