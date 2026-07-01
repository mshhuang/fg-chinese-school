import React, { useState, useEffect } from "react";
import { ClipboardEdit, Search, Loader2, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useLocation, useNavigate } from "react-router-dom";

export default function StaffAttendance() {
  const location = useLocation();
  const navigate = useNavigate();
  const stateClass = location.state?.class;

  const [searchQuery, setSearchQuery] = useState("");
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [user, setUser] = useState<any>(null);
  const [isTeacherUser, setIsTeacherUser] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const init = async () => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const parsedUser = JSON.parse(userStr);
          setUser(parsedUser);
          
          let query = supabase.from('classes').select('*').order('class_name');
          
          // Check if user is a teacher
          const { data: roles } = await supabase.from('user_roles')
            .select('roles(role_name)')
            .eq('user_id', parsedUser.id);
            
          const isTeacher = roles?.some((r: any) => r.roles?.role_name === 'Teacher');
          setIsTeacherUser(!!isTeacher);
          if (isTeacher) {
             query = query.eq('primary_teacher_id', parsedUser.id);
          }
          
          const { data, error } = await query;
          if (!error && data) {
            setClasses(data);
          }
        } catch (e) {}
      }
      setLoading(false);
      
      if (stateClass) {
        handleSelectClass(stateClass);
      }
    };
    init();
  }, [stateClass]);
  
  const handleSelectClass = async (cls: any, dateToUse?: string) => {
    const targetDate = dateToUse || attendanceDate;
    setSelectedClass(cls);
    setStudentsLoading(true);
    setAttendance({});
    setNotes({});
    
    // Fetch students
    const { data, error } = await supabase.from('enrollments')
      .select(`
         student_id,
         users!enrollments_student_id_fkey (first_name, last_name)
      `)
      .eq('class_id', cls.class_id);
      
    if (!error && data) {
       const mapped = data.map(d => ({
          student_id: d.student_id,
          first_name: (d.users as any)?.first_name || 'Unknown',
          last_name: (d.users as any)?.last_name || 'Student'
       })).sort((a, b) => a.last_name.localeCompare(b.last_name));
       setStudents(mapped);
       
       // check today's attendance
       const { data: existing } = await supabase.from('attendance')
          .select('student_id, status, notes')
          .eq('class_id', cls.class_id)
          .eq('attendance_date', targetDate);
          
       if (existing && existing.length > 0) {
          const attMap: Record<string, boolean> = {};
          const noteMap: Record<string, string> = {};
          existing.forEach(r => {
             if (r.student_id && r.status !== null) {
                attMap[r.student_id] = r.status === 'Present';
                if (r.notes) noteMap[r.student_id] = r.notes;
             }
          });
          setAttendance(attMap);
          setNotes(noteMap);
          setIsSubmitted(true);
       } else {
          // default all present
          const initMap: Record<string, boolean> = {};
          mapped.forEach(s => {
             if (s.student_id) initMap[s.student_id] = true;
          });
          setAttendance(initMap);
          setIsSubmitted(false);
       }
    }
    setStudentsLoading(false);
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass) return;
    setSaving(true);
    
    // delete existing for today
    await supabase.from('attendance')
       .delete()
       .eq('class_id', selectedClass.class_id)
       .eq('attendance_date', attendanceDate);
       
    // insert new
    const toInsert = Object.keys(attendance).map(studentId => ({
       class_id: selectedClass.class_id,
       student_id: studentId,
       attendance_date: attendanceDate,
       marked_by: user?.id,
       status: attendance[studentId] ? 'Present' : 'Absent',
       notes: !attendance[studentId] ? notes[studentId] || null : null
    }));
    
    if (toInsert.length > 0) {
       await supabase.from('attendance').insert(toInsert);
    }
    
    setSaving(false);
    setIsSubmitted(true);
    setSuccessMsg("Attendance submitted successfully!");
    
    setTimeout(() => {
      setSuccessMsg("");
    }, 3000);
  };
  
  const filteredClasses = classes.filter(c => c.class_name?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto w-full">
      <h1 className="font-display text-4xl text-on-surface font-bold tracking-tight mb-2">Attendance & Reports</h1>
      <p className="font-body text-on-surface-variant max-w-2xl text-lg mb-8">
        Submit the student attendance by class for today's sessions.
      </p>

      <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/30 shadow-[0_8px_30px_rgba(212,175,55,0.05)]">
        {!selectedClass ? (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h2 className="font-title text-2xl text-on-surface font-bold flex items-center gap-3">
                 <ClipboardEdit className="text-secondary w-6 h-6" /> 
                 Select a Class
              </h2>
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 absolute left-3 top-3 text-on-surface-variant" />
                <input 
                  type="text" 
                  placeholder="Search class..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-surface-container rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body text-sm"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {loading ? (
                  <div className="col-span-full py-8 text-center text-on-surface-variant flex justify-center items-center gap-2">
                     <Loader2 className="w-5 h-5 animate-spin" /> Loading classes...
                  </div>
               ) : filteredClasses.length === 0 ? (
                  <div className="col-span-full py-8 text-center text-on-surface-variant">No classes found.</div>
               ) : (
                  filteredClasses.map(cls => (
                     <button 
                       key={cls.class_id}
                       onClick={() => handleSelectClass(cls)}
                       className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 hover:border-primary/50 transition-colors text-left group"
                     >
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm shrink-0">
                              {cls.class_name?.substring(0,2).toUpperCase()}
                           </div>
                           <div className="min-w-0 flex-1">
                              <div className="font-title font-bold text-on-surface group-hover:text-primary transition-colors truncate">{cls.class_name}</div>
                              <div className="font-body text-xs text-on-surface-variant mt-0.5">Take Attendance</div>
                           </div>
                        </div>
                     </button>
                  ))
               )}
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
               <div className="flex items-center gap-4">
                  <button onClick={() => stateClass ? navigate('/teacher/classes') : setSelectedClass(null)} className="p-2 hover:bg-surface-variant rounded-full text-on-surface-variant transition-colors">
                     <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h2 className="font-title text-2xl text-on-surface font-bold flex items-center gap-3 truncate max-w-sm">
                     {selectedClass.class_name} Attendance
                  </h2>
               </div>
               <div className="flex items-center gap-4 flex-wrap">
                  <input 
                     type="date" 
                     value={attendanceDate}
                     onChange={(e) => {
                        setAttendanceDate(e.target.value);
                        handleSelectClass(selectedClass, e.target.value);
                     }}
                     className="font-label text-sm text-on-surface-variant bg-surface-container py-1.5 px-3 rounded-lg border border-outline-variant/20 hover:border-primary/30 outline-none focus:border-primary/50 transition-colors"
                  />
                  
                  {successMsg && (
                     <div className="flex items-center justify-center px-4 py-1.5 bg-primary/10 text-primary rounded-xl font-label text-sm font-bold animate-in fade-in zoom-in duration-300">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        {successMsg}
                     </div>
                  )}
                  {isSubmitted ? (
                     <button 
                        onClick={() => setIsSubmitted(false)}
                        className="bg-surface-variant text-on-surface-variant px-6 py-1.5 rounded-xl font-label text-sm font-bold shadow-sm hover:bg-surface-variant/80 transition-colors flex items-center gap-2"
                     >
                        Edit
                     </button>
                  ) : (
                     <button 
                        onClick={handleSaveAttendance}
                        disabled={saving || studentsLoading || students.length === 0}
                        className="bg-primary text-on-primary px-6 py-1.5 rounded-xl font-label text-sm font-bold shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                     >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {saving ? 'Saving...' : 'Submit'}
                     </button>
                  )}
               </div>
            </div>
            
            <div className="bg-surface-container-low rounded-2xl border border-outline-variant/20 overflow-hidden">
               {studentsLoading ? (
                  <div className="py-12 text-center text-on-surface-variant flex justify-center items-center gap-2">
                     <Loader2 className="w-5 h-5 animate-spin" /> Loading students...
                  </div>
               ) : students.length === 0 ? (
                  <div className="py-12 text-center text-on-surface-variant">
                     No students enrolled in this class.
                  </div>
               ) : (
                  <div className="divide-y divide-outline-variant/10">
                     {students.map((s, idx) => (
                        <div key={s.student_id} className="flex flex-col sm:flex-row sm:items-center p-4 hover:bg-surface-variant/20 transition-colors gap-4">
                           <div className="flex items-center gap-3 w-full sm:w-48 shrink-0">
                              <div className="w-10 h-10 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center font-bold text-sm shrink-0 uppercase">
                                 {idx + 1}
                              </div>
                              <span className="font-body text-sm font-bold text-on-surface truncate">{s.first_name} {s.last_name}</span>
                           </div>
                           <div className="flex items-center gap-2 flex-1 sm:justify-end flex-wrap">
                              {attendance[s.student_id] === false && (
                                  <input 
                                     type="text"
                                     placeholder="Reason for absence..."
                                     value={notes[s.student_id] || ''}
                                     onChange={e => setNotes(p => ({...p, [s.student_id]: e.target.value}))}
                                     disabled={isSubmitted}
                                     className="mr-2 px-3 py-1.5 bg-surface rounded-lg border border-outline-variant/30 text-sm outline-none focus:border-primary/50 transition-colors w-full sm:w-64 max-w-xs text-on-surface"
                                  />
                              )}
                              <button 
                                 onClick={() => !isSubmitted && setAttendance(p => ({...p, [s.student_id]: true}))}
                                 disabled={isSubmitted}
                                 className={`flex items-center justify-center gap-1.5 px-4 py-2 sm:px-3 sm:py-1.5 rounded-full font-label text-xs font-bold transition-colors w-24 sm:w-auto ${attendance[s.student_id] ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container border border-outline-variant/30 text-on-surface-variant'} ${!isSubmitted ? 'hover:bg-surface-variant' : 'opacity-80 cursor-default'}`}
                              >
                                 <CheckCircle2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> Present
                              </button>
                              <button 
                                 onClick={() => !isSubmitted && setAttendance(p => ({...p, [s.student_id]: false}))}
                                 disabled={isSubmitted}
                                 className={`flex items-center justify-center gap-1.5 px-4 py-2 sm:px-3 sm:py-1.5 rounded-full font-label text-xs font-bold transition-colors w-24 sm:w-auto ${attendance[s.student_id] === false ? 'bg-error text-error-container shadow-sm' : 'bg-surface-container border border-outline-variant/30 text-on-surface-variant'} ${!isSubmitted ? 'hover:bg-surface-variant' : 'opacity-80 cursor-default'}`}
                              >
                                 <XCircle className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> Absent
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
            
            
          </>
        )}
      </div>
    </div>
  );
}
