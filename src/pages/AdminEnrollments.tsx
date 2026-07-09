import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Plus, Trash2, User, Users, GraduationCap, DollarSign, BookOpen, Calendar as CalendarIcon, Check, Pencil, X } from "lucide-react";

export default function AdminEnrollments() {
  const [users, setUsers] = useState<any[]>([]);
  const [families, setFamilies] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [enrollmentMode, setEnrollmentMode] = useState<"parent" | "direct">("direct");
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  
  // Form State
  const [selectedParent, setSelectedParent] = useState("");
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  const [enrollmentDetails, setEnrollmentDetails] = useState({
    class_id: "",
    program: "",
    notes: "",
    status: "Active",
    enrollment_date: "2026-07-06",
    drop_date: ""
  });

  const [toastMessage, setToastMessage] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  const startEditing = (enr: any) => {
    setEditingId(enr.enrollment_id);
    setEditData({ ...enr });
  };

  const saveEdit = async () => {
    const isDuplicate = enrollments.some(enr => 
        enr.enrollment_id !== editingId &&
        enr.student_id === editData.student_id &&
        enr.program_id === editData.program_id &&
        (enr.class_id || null) === (editData.class_id || null)
    );

    if (isDuplicate) {
        showToast("This user is already enrolled in this program and class.", "error");
        return;
    }

    // @ts-ignore
    const { error } = await supabase.from('enrollments').update({
      class_id: editData.class_id || null,
      program_id: editData.program_id,
      status: editData.status,
      enrollment_date: editData.enrollment_date || null,
      drop_date: editData.drop_date || null,
      notes: editData.notes
    }).eq('enrollment_id', editingId);

    if (error) {
      showToast("Error updating enrollment: " + error.message, "error");
    } else {
      setEditingId(null);
      fetchData();
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try { const [usersRes, familiesRes, enrollmentsRes, classesRes, programsRes, userRolesRes] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('parent_child').select('*'),
      supabase.from('enrollments').select('*'),
      supabase.from('classes').select('*'),
      supabase.from('programs').select('*').order('program_name', { ascending: true }),
      supabase.from('user_roles').select('user_id, roles!inner(role_name)').in('roles.role_name', ['Student', 'Teacher', 'Volunteer'])
    ]);
    if (usersRes.error) console.error("Users Fetch Error:", usersRes.error);
    if (usersRes.data) setUsers(usersRes.data);
    if (familiesRes.error) console.error("Families Fetch Error:", familiesRes.error);
    if (familiesRes.data) setFamilies(familiesRes.data);
    if (enrollmentsRes.error) console.error("Enrollments Fetch Error:", enrollmentsRes.error);
    if (enrollmentsRes.data) setEnrollments(enrollmentsRes.data);
    if (classesRes.data) setClasses(classesRes.data);
    if (programsRes.error) console.error("Programs Fetch Error:", programsRes.error);
    if (programsRes.data) setPrograms(programsRes.data);
    if (userRolesRes && userRolesRes.data && usersRes.data) {
       const allowedRoles = ['student', 'teacher', 'volunteer'];
       const studentRoleMappings = userRolesRes.data.filter((ur: any) => allowedRoles.includes(ur.roles?.role_name?.toLowerCase()));
       const studentIds = new Set(studentRoleMappings.map((ur: any) => ur.user_id));
       const studentsList = usersRes.data.filter(u => studentIds.has(u.user_id));
       studentsList.sort((a, b) => a.last_name?.localeCompare(b.last_name));
       setAllStudents(studentsList);
    }
    setLoading(false);
    } catch (e) { console.error("Promise.all error:", e); setLoading(false); }
  }

  const parentUsers = users.filter(u => families.some(f => f.parent_id === u.user_id));
  
  const currentChildrenRaw = selectedParent 
    ? families.filter(f => f.parent_id === selectedParent && f.child_id !== selectedParent).map(f => users.find(u => u.user_id === f.child_id)).filter(Boolean)
    : [];
  const currentChildren = Array.from(new Map(currentChildrenRaw.map(c => [c.user_id, c])).values());

  async function handleSubmit(e: any) {
    try {
      if (e && typeof e.preventDefault === "function") e.preventDefault();
      
      if (enrollmentMode === "parent" && !selectedParent) {
         showToast("Please select a parent.", "error");
         return;
      }
      
      if (selectedChildren.length === 0) {
         showToast("Please select at least one user.", "error");
         return;
      }
      if (!enrollmentDetails.program) {
         showToast("Please select a program.", "error");
         return;
      }
      if (!enrollmentDetails.status) {
         showToast("Please select a status.", "error");
         return;
      }
      if (!enrollmentDetails.enrollment_date) {
         showToast("Please select an enrollment date.", "error");
         return;
      }
      
      // Create an enrollment for each selected child
      const newEnrollments: any[] = [];
      const duplicateNames: string[] = [];

      for (const childId of selectedChildren) {
         const isDuplicate = enrollments.some(enr => 
            enr.student_id === childId &&
            enr.program_id === enrollmentDetails.program &&
            (enr.class_id || null) === (enrollmentDetails.class_id || null)
         );

         if (isDuplicate) {
            const childInUsers = users.find(u => u.user_id === childId);
            duplicateNames.push(childInUsers ? `${childInUsers.first_name} ${childInUsers.last_name}` : "Student");
         } else {
            newEnrollments.push({
               student_id: childId,
               class_id: enrollmentDetails.class_id || null,
               program_id: enrollmentDetails.program,
               notes: enrollmentDetails.notes,
               status: enrollmentDetails.status,
               enrollment_date: enrollmentDetails.enrollment_date || null,
               drop_date: enrollmentDetails.drop_date || null
            });
         }
      }

      if (duplicateNames.length > 0) {
         showToast(`The following users are already enrolled in this program and class: ${duplicateNames.join(', ')}`, "error");
         if (newEnrollments.length === 0) return;
      }

      // @ts-ignore
      const { data, error } = await supabase.from('enrollments').insert(newEnrollments).select();
      
      if (!error) {
         setShowForm(false);
         setSelectedParent("");
         setSelectedChildren([]);
         setEnrollmentDetails({ class_id: "", program: "", notes: "", status: "Active", enrollment_date: "2026-07-06", drop_date: "" });
         fetchData();
         showToast("Successfully enrolled!", "success");
      } else {
         console.error("Supabase insert error details:", error);
         showToast("Error creating enrollments: " + error.message, "error");
      }
    } catch (err: any) {
      console.error("Caught exception in handleSubmit:", err);
      showToast("Unexpected error: " + err.message, "error");
    }
  }

  async function handleDelete(id: string) {
    if(!confirm("Are you sure you want to delete this enrollment?")) return; console.log("deleting", id);
    await supabase.from('enrollments').delete().eq('enrollment_id', id);
    fetchData();
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex justify-between items-center bg-surface-container-low p-6 rounded-3xl border border-outline-variant/30">
         <div>
            <h2 className="font-display text-2xl font-bold text-on-surface">Enrollments</h2>
            <p className="font-body text-on-surface-variant mt-1">Manage user enrollments and programs.</p>
         </div>
         <button 
           onClick={() => setShowForm(!showForm)}
           className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-label font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors"
         >
            <Plus className="w-5 h-5" /> New Enrollment
         </button>
      </div>

      {showForm && (
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm flex flex-col gap-8">
           <h3 className="font-title text-xl font-bold text-on-surface">Create Enrollments</h3>
           <form onSubmit={handleSubmit} className="flex flex-col gap-8">
              
              {/* Selection Mode Toggle */}
              <div className="flex gap-4 border-b border-outline-variant/30 pb-4">
                 <button 
                    type="button"
                    onClick={() => { setEnrollmentMode("parent"); setSelectedChildren([]); setSelectedParent(""); }}
                    className={`font-label font-bold text-sm px-4 py-2 rounded-full transition-colors ${enrollmentMode === "parent" ? "bg-primary text-on-primary" : "bg-surface-variant text-on-surface-variant hover:bg-surface-container-high"}`}
                 >
                    By Parent / Family
                 </button>
                 <button 
                    type="button"
                    onClick={() => { setEnrollmentMode("direct"); setSelectedChildren([]); }}
                    className={`font-label font-bold text-sm px-4 py-2 rounded-full transition-colors ${enrollmentMode === "direct" ? "bg-primary text-on-primary" : "bg-surface-variant text-on-surface-variant hover:bg-surface-container-high"}`}
                 >
                    Direct User Selection
                 </button>
              </div>

              {enrollmentMode === "parent" && (
                <>
                  <div className="flex flex-col gap-4 bg-surface-container p-5 rounded-2xl">
                     <div className="flex items-center gap-2 text-primary font-bold font-label">
                        <Users className="w-5 h-5" /> Parent / Guardian selection
                     </div>
                     <select value={selectedParent} onChange={(e) => {
                        setSelectedParent(e.target.value);
                        setSelectedChildren([]); 
                     }} className="px-4 py-3 rounded-xl border border-outline-variant/50 popup focus:border-primary outline-none font-body bg-surface text-on-surface">
                        <option value="">-- Select Parent --</option>
                        {parentUsers.map(p => (
                           <option key={p.user_id} value={p.user_id}>{p.first_name} {p.last_name}</option>
                        ))}
                     </select>
                  </div>

                  {selectedParent && (
                    <div className="flex flex-col gap-4 bg-surface-container p-5 rounded-2xl">
                       <div className="flex items-center gap-2 text-secondary font-bold font-label">
                          <GraduationCap className="w-5 h-5" /> Select Children
                       </div>
                       <div className="flex flex-col gap-3">
                         {currentChildren.length === 0 ? (
                            <p className="text-on-surface-variant font-body py-2 italic text-sm">No children linked to this parent.</p>
                         ) : currentChildren.map((child: any) => (
                            <label key={child.user_id} className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-outline-variant/30 cursor-pointer hover:border-primary/50 transition-colors">
                               <input 
                                  type="checkbox" 
                                  checked={selectedChildren.includes(child.user_id)}
                                  onChange={(e) => {
                                     if (e.target.checked) setSelectedChildren([...selectedChildren, child.user_id]);
                                     else setSelectedChildren(selectedChildren.filter(id => id !== child.user_id));
                                  }}
                                  className="w-5 h-5 text-primary rounded border-outline-variant" 
                               />
                               <div className="flex flex-col">
                                  <span className="font-label font-bold text-on-surface">{child.first_name} {child.last_name}</span>
                               </div>
                            </label>
                         ))}
                       </div>
                    </div>
                  )}
                </>
              )}

              {enrollmentMode === "direct" && (
                 <div className="flex flex-col gap-4 bg-surface-container p-5 rounded-2xl">
                    <div className="flex items-center gap-2 text-secondary font-bold font-label">
                       <GraduationCap className="w-5 h-5" /> Select Users
                    </div>
                    
                    <input 
                       type="text" 
                       placeholder="Search users by name..."
                       value={studentSearchTerm}
                       onChange={(e) => setStudentSearchTerm(e.target.value)}
                       className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface mb-2"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2">
                       {allStudents
                         .filter(student => (student.first_name + " " + student.last_name).toLowerCase().includes(studentSearchTerm.toLowerCase()))
                         .filter(student => {
                            if (!enrollmentDetails.class_id) return true;
                            // Filter out students already enrolled in the selected class
                            const isAlreadyEnrolled = enrollments.some(e => 
                               e.student_id === student.user_id && 
                               e.class_id === Number(enrollmentDetails.class_id)
                            );
                            return !isAlreadyEnrolled;
                         })
                         .map(student => {
                          const studentEnrollments = enrollments.filter(e => e.student_id === student.user_id && e.class_id);
                          const currentClasses = studentEnrollments.map(e => classes.find(c => c.class_id === e.class_id)?.class_name).filter(Boolean);
                          
                          return (
                          <label key={student.user_id} className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-outline-variant/30 cursor-pointer hover:border-primary/50 transition-colors">
                             <input 
                                type="checkbox" 
                                checked={selectedChildren.includes(student.user_id)}
                                onChange={(e) => {
                                   if (e.target.checked) setSelectedChildren([...selectedChildren, student.user_id]);
                                   else setSelectedChildren(selectedChildren.filter(id => id !== student.user_id));
                                }}
                                className="w-5 h-5 text-primary rounded border-outline-variant" 
                             />
                             <div className="flex flex-col">
                                <span className="font-label font-bold text-on-surface">{student.first_name} {student.last_name}</span>
                                {currentClasses.length > 0 && (
                                   <span className="font-body text-xs text-secondary mt-0.5">Classes: {currentClasses.join(", ")}</span>
                                )}
                             </div>
                          </label>
                          );
                       })}
                       {allStudents.filter(student => (student.first_name + " " + student.last_name).toLowerCase().includes(studentSearchTerm.toLowerCase())).filter(student => !enrollmentDetails.class_id || !enrollments.some(e => e.student_id === student.user_id && e.class_id === Number(enrollmentDetails.class_id))).length === 0 && (
                          <p className="text-on-surface-variant font-body py-2 italic text-sm col-span-2">No users found or all match current class.</p>
                       )}
                    </div>
                 </div>
              )}

              {/* Enrollment Details */}
              <div className="flex flex-col gap-4 bg-surface-container p-5 rounded-2xl">
                 <div className="flex items-center gap-2 text-tertiary font-bold font-label">
                    <BookOpen className="w-5 h-5" /> Enrollment Details
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                       <label className="font-label text-sm font-bold text-on-surface-variant">Class (Optional)</label>
                       <select value={enrollmentDetails.class_id} onChange={(e) => setEnrollmentDetails({...enrollmentDetails, class_id: e.target.value})} className="px-4 py-3 rounded-xl border border-outline-variant/50 popup focus:border-primary outline-none font-body bg-surface text-on-surface">
                          <option value="">-- No Class Selected --</option>
                          {classes.map(c => (
                             <option key={c.class_id} value={c.class_id}>{c.class_name}</option>
                          ))}
                       </select>
                    </div>
                    <div className="flex flex-col gap-2">
                       <label className="font-label text-sm font-bold text-on-surface-variant">Program</label>
                       <select value={enrollmentDetails.program} onChange={(e) => setEnrollmentDetails({...enrollmentDetails, program: e.target.value})} className="px-4 py-3 rounded-xl border border-outline-variant/50 popup focus:border-primary outline-none font-body bg-surface text-on-surface">
                           <option value="">-- Select Program --</option>
                           {programs.map(p => (
                              <option key={p.program_id} value={p.program_id}>{p.program_name}</option>
                           ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                       <label className="font-label text-sm font-bold text-on-surface-variant">Status</label>
                       <select value={enrollmentDetails.status} onChange={(e) => setEnrollmentDetails({...enrollmentDetails, status: e.target.value})} className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface">
                          <option value="Active">Active</option>
                          <option value="Pending">Pending</option>
                          <option value="Dropped">Dropped</option>
                          <option value="Completed">Completed</option>
                       </select>
                    </div>
                    <div className="flex flex-col gap-2">
                       <label className="font-label text-sm font-bold text-on-surface-variant">Enrollment Date</label>
                       <input type="date" value={enrollmentDetails.enrollment_date} onChange={(e) => setEnrollmentDetails({...enrollmentDetails, enrollment_date: e.target.value})} className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface" />
                    </div>
                    <div className="flex flex-col gap-2">
                       <label className="font-label text-sm font-bold text-on-surface-variant">Drop Date (Optional)</label>
                       <input type="date" value={enrollmentDetails.drop_date} onChange={(e) => setEnrollmentDetails({...enrollmentDetails, drop_date: e.target.value})} className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface" />
                    </div>
                    <div className="flex flex-col gap-2">
                       <label className="font-label text-sm font-bold text-on-surface-variant">Notes</label>
                       <input type="text" value={enrollmentDetails.notes} onChange={(e) => setEnrollmentDetails({...enrollmentDetails, notes: e.target.value})} placeholder="e.g. Additional info" className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface" />
                    </div>
                 </div>
              </div>

              <div className="flex gap-4">
                 <button type="button" onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-on-primary px-8 py-3 rounded-full font-label font-bold shadow-sm transition-colors">
                    Enroll Selected Children
                 </button>
                 <button type="button" onClick={() => setShowForm(false)} className="border border-outline-variant hover:bg-surface-variant text-on-surface-variant px-8 py-3 rounded-full font-label font-bold transition-colors">
                    Cancel
                 </button>
              </div>

           </form>
        </div>
      )}

      {/* Enrollments List */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl overflow-hidden shadow-sm">
         <div className="overflow-x-auto overflow-y-auto max-h-[600px] p-0">
            <table className="w-full text-left border-collapse min-w-[800px] relative">
               <thead className="sticky top-0 z-10">
                  <tr className="bg-surface-container-low border-b border-outline-variant/30 text-on-surface-variant shadow-sm">
                     <th className="p-4 font-label text-xs uppercase tracking-wider font-bold">User</th>
                     <th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Parent</th>
                     <th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Program</th>
                     <th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Class</th>
                     <th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Enrollment Date</th>
                     <th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Drop Date</th>
                     <th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Status</th>
                     <th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Notes</th>
                     <th className="p-4 font-label text-xs uppercase tracking-wider font-bold text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-outline-variant/20">
                 {loading ? (
                   <tr><td colSpan={9} className="p-8 text-center text-on-surface-variant font-body">Loading...</td></tr>
                 ) : enrollments.length === 0 ? (
                   <tr><td colSpan={9} className="p-8 text-center text-on-surface-variant font-body">No enrollments found.</td></tr>
                 ) : enrollments.map(enr => {
                    const student = users.find(u => u.user_id === enr.student_id);
                    const classInfo = classes.find(c => c.class_id === enr.class_id);
                    const studentFamilies = families.filter(f => f.child_id === enr.student_id);
                    const parentNames = studentFamilies.map(f => {
                       const p = users.find(u => u.user_id === f.parent_id);
                       return p ? `${p.first_name} ${p.last_name}` : null;
                    }).filter(Boolean).join(', ');

                    const isEditing = editingId === enr.enrollment_id;

                    return (
                       <tr key={enr.enrollment_id} className="hover:bg-surface-variant/30 transition-colors">
                         <td className="p-4">
                            <div className="font-label font-bold text-on-surface">{student?.first_name} {student?.last_name}</div>
                         </td>
                         <td className="p-4">
                            <span className="font-body text-sm text-on-surface-variant">{parentNames || 'None'}</span>
                         </td>
                         <td className="p-4">
                            {isEditing ? (
                               <select value={editData.program_id || ''} onChange={e => setEditData({...editData, program_id: e.target.value})} className="px-2 py-1 rounded border border-outline-variant/50 popup focus:border-primary outline-none font-body bg-surface text-sm w-full">
                                  <option value="">-- Select Program --</option>
                                  {programs.map(p => <option key={p.program_id} value={p.program_id}>{p.program_name}</option>)}
                               </select>
                            ) : (
                               <span className="font-title text-sm text-on-surface">{programs.find(p => p.program_id === enr.program_id)?.program_name || enr.program || 'N/A'}</span>
                            )}
                         </td>
                         <td className="p-4">
                            {isEditing ? (
                               <select value={editData.class_id || ''} onChange={e => setEditData({...editData, class_id: e.target.value})} className="px-2 py-1 rounded border border-outline-variant/50 popup focus:border-primary outline-none font-body bg-surface text-sm w-full">
                                  <option value="">-- Unassigned --</option>
                                  {classes.map(c => <option key={c.class_id} value={c.class_id}>{c.class_name}</option>)}
                               </select>
                            ) : (
                               <span className="font-body text-sm text-on-surface">{classInfo?.class_name || 'Unassigned'}</span>
                            )}
                         </td>
                         <td className="p-4">
                            {isEditing ? (
                               <input type="date" value={editData.enrollment_date || ''} onChange={e => setEditData({...editData, enrollment_date: e.target.value})} className="px-2 py-1 rounded border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-sm w-full" />
                            ) : (
                               <span className="font-body text-sm text-on-surface-variant">{enr.enrollment_date || 'N/A'}</span>
                            )}
                         </td>
                         <td className="p-4">
                            {isEditing ? (
                               <input type="date" value={editData.drop_date || ''} onChange={e => setEditData({...editData, drop_date: e.target.value})} className="px-2 py-1 rounded border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-sm w-full" />
                            ) : (
                               <span className="font-body text-sm text-on-surface-variant">{enr.drop_date || 'N/A'}</span>
                            )}
                         </td>
                         <td className="p-4">
                            {isEditing ? (
                               <select value={editData.status || ''} onChange={e => setEditData({...editData, status: e.target.value})} className="px-2 py-1 rounded border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-sm w-full">
                                  <option value="Active">Active</option>
                                  <option value="Pending">Pending</option>
                                  <option value="Dropped">Dropped</option>
                                  <option value="Completed">Completed</option>
                               </select>
                            ) : (
                               <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                 enr.status === 'Active' ? 'bg-primary-container/30 text-primary' : 
                                 enr.status === 'Dropped' ? 'bg-error-container/30 text-error' : 
                                 enr.status === 'Completed' ? 'bg-tertiary-container/30 text-tertiary' : 
                                 'bg-surface-variant text-on-surface-variant'
                               }`}>
                                  {enr.status || 'Active'}
                               </span>
                            )}
                         </td>
                         <td className="p-4">
                            {isEditing ? (
                               <input type="text" value={editData.notes || ''} onChange={e => setEditData({...editData, notes: e.target.value})} className="px-2 py-1 rounded border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-sm w-full" />
                            ) : (
                               <span className="font-body text-sm text-on-surface-variant">{enr.notes || ''}</span>
                            )}
                         </td>
                         <td className="p-4 text-right flex items-center justify-end gap-1 min-w-[80px]">
                            {isEditing ? (
                               <>
                                  <button onClick={saveEdit} className="w-8 h-8 rounded-full inline-flex items-center justify-center text-primary hover:bg-primary/10 transition-colors">
                                     <Check className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => setEditingId(null)} className="w-8 h-8 rounded-full inline-flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-colors">
                                     <X className="w-4 h-4" />
                                  </button>
                               </>
                            ) : (
                               <>
                                  <button onClick={() => startEditing(enr)} className="w-8 h-8 rounded-full inline-flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-colors cursor-pointer">
                                     <Pencil className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleDelete(enr.enrollment_id)} className="w-8 h-8 rounded-full inline-flex items-center justify-center text-on-surface-variant hover:bg-error-container hover:text-error transition-colors cursor-pointer">
                                     <Trash2 className="w-4 h-4" />
                                  </button>
                               </>
                            )}
                         </td>
                       </tr>
                    );
                 })}
               </tbody>
            </table>
         </div>
      </div>
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 p-4 rounded-xl shadow-lg z-50 text-white font-body animate-in fade-in slide-in-from-bottom-8 ${
           toastMessage.type === 'success' ? 'bg-green-600' : 
           toastMessage.type === 'error' ? 'bg-orange-500' : 'bg-blue-500'
        }`}>
          {toastMessage.message}
        </div>
      )}
    </div>
  );
}
