import { useState, useEffect } from "react";
import { Printer, Download, Users, School, BookOpen, ClipboardList, KeyRound, CheckSquare } from "lucide-react";
import { supabase } from "../lib/supabase";
import { formatTeacherName } from "../lib/utils";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState<'teachers' | 'students' | 'classes' | 'enrollments' | 'credentials' | 'attendance'>('teachers');
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [attendanceTeacherFilter, setAttendanceTeacherFilter] = useState('all');
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Fetch all data
        const { data: usersData } = await supabase.from('users').select('*');
        const { data: rolesData } = await supabase.from('roles').select('*');
        const { data: userRolesData } = await supabase.from('user_roles').select('*');
        const { data: classData, error: classError } = await supabase.from('classes').select('*');
        if (classError) console.error("Class fetch error:", classError);
        const { data: enrollmentsData, error: enrollmentsError } = await supabase.from('enrollments').select('*');
        if (enrollmentsError) console.error("Enrollments fetch error:", enrollmentsError);
        const { data: programsData } = await supabase.from('programs').select('*');
        
        if (enrollmentsData) {
          setEnrollments(enrollmentsData);
        }
        if (programsData) {
          setPrograms(programsData);
        }

        if (usersData && rolesData && userRolesData && usersData.length > 0) {
           const teacherRole = rolesData.find((r: any) => r.role_name.toLowerCase() === 'teacher');
           const studentRole = rolesData.find((r: any) => r.role_name.toLowerCase() === 'student');
           const volunteerRole = rolesData.find((r: any) => r.role_name.toLowerCase() === 'volunteer');
           
           if (teacherRole) {
             const teacherIds = userRolesData.filter((ur: any) => ur.role_id === teacherRole.role_id).map((ur: any) => ur.user_id);
             setTeachers(usersData.filter((u: any) => teacherIds.includes(u.user_id)));
           }
           
           if (studentRole) {
             const studentIds = userRolesData.filter((ur: any) => ur.role_id === studentRole.role_id).map((ur: any) => ur.user_id);
             setStudents(usersData.filter((u: any) => studentIds.includes(u.user_id)));
           }

           if (volunteerRole) {
             const volunteerIds = userRolesData.filter((ur: any) => ur.role_id === volunteerRole.role_id).map((ur: any) => ur.user_id);
             setVolunteers(usersData.filter((u: any) => volunteerIds.includes(u.user_id)));
           }
        } else {
           // Fallback mock data if database is empty
           setTeachers([
             { user_id: 'USR-101', first_name: 'Chen', last_name: 'Jian', email: 'chen.j@school.edu' },
             { user_id: 'USR-102', first_name: 'Sarah', last_name: 'Miller', email: 's.miller@school.edu' },
             { user_id: 'USR-103', first_name: 'David', last_name: 'Wong', email: 'd.wong@school.edu' }
           ]);
           setStudents([
             { user_id: 'STU-201', first_name: 'Mei', last_name: 'Lin', email: 'mei.l@student.school.edu' },
             { user_id: 'STU-202', first_name: 'Alex', last_name: 'Johnson', email: 'a.johnson@student.school.edu' },
             { user_id: 'STU-203', first_name: 'Leo', last_name: 'Garcia', email: 'l.garcia@student.school.edu' }
           ]);
           setEnrollments([
             { student_id: 'STU-201', class_id: 'CLS-1' },
             { student_id: 'STU-202', class_id: 'CLS-2' }
           ]);
        }

        if (classData && classData.length > 0) {
          setClasses(classData);
        } else {
          setClasses([
            { class_id: 'CLS-1', name: 'Grade 4 Math', room: 'Room 101', primary_teacher_id: 'USR-101', users: { first_name: 'Chen', last_name: 'Jian' } },
            { class_id: 'CLS-2', name: 'Grade 5 Science', room: 'Lab 2', primary_teacher_id: 'USR-102', users: { first_name: 'Sarah', last_name: 'Miller' } },
            { class_id: 'CLS-3', name: 'Art History', room: 'Studio B', primary_teacher_id: 'USR-103', users: { first_name: 'David', last_name: 'Wong' } }
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'attendance') {
       fetchAttendance();
    }
  }, [activeTab, attendanceDate]);

  async function fetchAttendance() {
     setAttendanceLoading(true);
     const { data, error } = await supabase
       .from('attendance')
       .select(`
         *,
         users:student_id (first_name, last_name, user_name),
         classes!inner (class_id, class_name, primary_teacher_id)
       `)
       .eq('attendance_date', attendanceDate);
       
     if (data) {
       setAttendanceRecords(data);
     } else if (error) {
       console.error("Attendance fetch error:", error);
     }
     setAttendanceLoading(false);
  }

  const handlePrint = () => {
    // The underlying html2canvas library does not support modern CSS color functions like 'oklab'
    // which are used heavily in this Tailwind application.
    // Instead, we trigger the browser's native print dialog which natively supports "Save to PDF"
    // and correctly renders all modern CSS colors and layouts.
    window.print();
  };

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 w-full max-w-7xl mx-auto h-full overflow-hidden print:overflow-visible print:h-auto print:p-0">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 print:hidden">
        <div>
           <h1 className="font-display text-3xl text-primary font-bold tracking-tight">System Reports</h1>
           <p className="font-body text-on-surface-variant mt-1">View and print data reports for teachers, students, and classes.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-3 rounded-full font-label font-bold transition-colors shadow-sm bg-primary text-on-primary hover:bg-primary/90"
          >
            <Download className="w-5 h-5" />
            Generate PDF
          </button>
        </div>
      </header>

      <div className="flex bg-surface-container-low p-1 rounded-2xl w-fit shrink-0 print:hidden">
        <button
          onClick={() => setActiveTab('teachers')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-label font-bold text-sm transition-all ${
            activeTab === 'teachers' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Users className="w-4 h-4" /> Teachers
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-label font-bold text-sm transition-all ${
            activeTab === 'students' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Users className="w-4 h-4" /> Students
        </button>
        <button
          onClick={() => setActiveTab('classes')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-label font-bold text-sm transition-all ${
            activeTab === 'classes' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <School className="w-4 h-4" /> Classes
        </button>
        <button
          onClick={() => setActiveTab('enrollments')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-label font-bold text-sm transition-all ${
            activeTab === 'enrollments' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <ClipboardList className="w-4 h-4" /> Enrollments
        </button>
        <button
          onClick={() => setActiveTab('credentials')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-label font-bold text-sm transition-all ${
            activeTab === 'credentials' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <KeyRound className="w-4 h-4" /> Credentials
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-label font-bold text-sm transition-all ${
            activeTab === 'attendance' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <CheckSquare className="w-4 h-4" /> Attendance
        </button>
      </div>

      <div id="report-content-area" className="flex-1 overflow-auto bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-sm print:border-none print:shadow-none print:bg-white print:overflow-visible">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="p-6 print:p-0">
            {activeTab === 'teachers' && (
              <div>
                <p className="text-on-surface-variant mb-6 print:hidden">A comprehensive list of all teachers currently active in the system, including contact details.</p>
                <div className="hidden print:flex justify-between items-end border-b-2 border-black pb-2 mb-6">
                   <h2 className="font-display text-2xl font-bold">Teachers Report</h2>
                   <span className="font-mono text-sm">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant/50">
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Name</th>
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Email</th>
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Classes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teachers.map((teacher, idx) => {
                        const teacherClasses = classes.filter(c => String(c.primary_teacher_id) === String(teacher.user_id)).map(c => c.name || c.class_name);
                        return (
                        <tr key={teacher.user_id || idx} className="border-b border-outline-variant/20 hover:bg-surface-variant/30 print:hover:bg-transparent">
                          <td className="py-3 px-4 font-body text-on-surface font-medium">{formatTeacherName(teacher.first_name, teacher.last_name)}</td>
                          <td className="py-3 px-4 font-body text-on-surface-variant">{teacher.email || 'N/A'}</td>
                          <td className="py-3 px-4 font-body text-sm text-on-surface-variant">
                             {teacherClasses.length > 0 ? teacherClasses.join(', ') : 'No classes assigned'}
                          </td>
                        </tr>
                      )})}
                      {teachers.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-6 text-center text-on-surface-variant">No teachers found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'students' && (
              <div>
                <p className="text-on-surface-variant mb-6 print:hidden">A complete directory of all enrolled students, detailing grade levels and contact information.</p>
                <div className="hidden print:flex justify-between items-end border-b-2 border-black pb-2 mb-6">
                   <h2 className="font-display text-2xl font-bold">Students Report</h2>
                   <span className="font-mono text-sm">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant/50">
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Name</th>
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Email</th>
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Programs</th>
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Classes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student, idx) => {
                        const studentEnrollments = enrollments.filter(e => String(e.student_id) === String(student.user_id));
                        
                        const studentClassIds = studentEnrollments.map(e => e.class_id).filter(Boolean);
                        const studentClasses = classes.filter(c => studentClassIds.some(id => String(id) === String(c.class_id))).map(c => c.name || c.class_name);

                        const studentProgramIds = studentEnrollments.map(e => e.program_id).filter(Boolean);
                        const studentPrograms = programs.filter(p => studentProgramIds.some(id => String(id) === String(p.program_id))).map(p => p.program_name);

                        return (
                        <tr key={student.user_id || idx} className="border-b border-outline-variant/20 hover:bg-surface-variant/30 print:hover:bg-transparent">
                          <td className="py-3 px-4 font-body text-on-surface font-medium">{student.first_name} {student.last_name}</td>
                          <td className="py-3 px-4 font-body text-on-surface-variant">{student.email || 'N/A'}</td>
                          <td className="py-3 px-4 font-body text-sm text-on-surface-variant">
                             {studentPrograms.length > 0 ? studentPrograms.join(', ') : 'No programs'}
                          </td>
                          <td className="py-3 px-4 font-body text-sm text-on-surface-variant">
                             {studentClasses.length > 0 ? studentClasses.join(', ') : 'Not enrolled'}
                          </td>
                        </tr>
                      )})}
                      {students.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-on-surface-variant">No students found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'classes' && (
              <div>
                <p className="text-on-surface-variant mb-6 print:hidden">An overview of all active classes, showing assigned teachers, locations, and schedules.</p>
                <div className="hidden print:flex justify-between items-end border-b-2 border-black pb-2 mb-6">
                   <h2 className="font-display text-2xl font-bold">Classes Report</h2>
                   <span className="font-mono text-sm">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant/50">
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Class Name</th>
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Room</th>
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Primary Teacher</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classes.map((cls, idx) => (
                        <tr key={cls.class_id || idx} className="border-b border-outline-variant/20 hover:bg-surface-variant/30 print:hover:bg-transparent">
                          <td className="py-3 px-4 font-body text-on-surface font-medium">{cls.class_name || cls.name || 'Unnamed Class'}</td>
                          <td className="py-3 px-4 font-body text-on-surface-variant">{cls.room || 'N/A'}</td>
                          <td className="py-3 px-4 font-body text-on-surface-variant">
                            {(() => {
                              if (cls.users) return formatTeacherName(cls.users.first_name, cls.users.last_name);
                              const teacher = teachers.find(t => t.user_id === cls.primary_teacher_id);
                              return teacher ? formatTeacherName(teacher.first_name, teacher.last_name) : 'Unassigned';
                            })()}
                          </td>
                        </tr>
                      ))}
                      {classes.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-6 text-center text-on-surface-variant">No classes found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'enrollments' && (
              <div>
                <p className="text-on-surface-variant mb-6 print:hidden">A detailed breakdown of student enrollments grouped by class, including unassigned students.</p>
                <div className="hidden print:flex justify-between items-end border-b-2 border-black pb-2 mb-6">
                   <h2 className="font-display text-2xl font-bold">Enrollments Report</h2>
                   <span className="font-mono text-sm">{new Date().toLocaleDateString()}</span>
                </div>
                
                {programs.map(program => {
                   const programEnrollments = enrollments.filter(e => String(e.program_id) === String(program.program_id));
                   if (programEnrollments.length === 0) return null;
                   
                   const classGroups = programEnrollments.reduce((acc, enr) => {
                     const classId = enr.class_id || 'unassigned';
                     if (!acc[classId]) acc[classId] = [];
                     acc[classId].push(enr);
                     return acc;
                   }, {} as Record<string, any[]>);
                   
                   return (
                     <div key={program.program_id} className="mb-8">
                       <h3 className="font-display text-xl font-bold mb-4 px-2 py-1 bg-surface-container rounded-lg">{program.program_name}</h3>
                       
                       {Object.keys(classGroups).map(classId => {
                          const cls = classId === 'unassigned' ? null : classes.find(c => String(c.class_id) === String(classId));
                          const classEnrollments = classGroups[classId];
                          
                          let teacherName = 'Unassigned';
                          if (cls) {
                             if (cls.users) {
                               teacherName = formatTeacherName(cls.users.first_name, cls.users.last_name);
                             } else {
                               const teacher = teachers.find(t => t.user_id === cls.primary_teacher_id);
                               if (teacher) teacherName = formatTeacherName(teacher.first_name, teacher.last_name);
                             }
                          }

                          return (
                            <div key={classId} className="mb-6 ml-4">
                              <h4 className="font-label font-bold text-lg mb-2 text-on-surface flex justify-between items-end border-b border-outline-variant/30 pb-1">
                                <span>{cls ? (cls.class_name || cls.name) : 'Unassigned Class'}</span>
                                <span className="text-sm font-normal text-on-surface-variant">Teacher: {teacherName}</span>
                              </h4>
                              <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                  <thead>
                                    <tr className="border-b border-outline-variant/50">
                                      <th className="py-2 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Student Name</th>
                                      <th className="py-2 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Student Email</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {classEnrollments.map((enr, idx) => {
                                      const student = students.find(s => String(s.user_id) === String(enr.student_id));
                                      return (
                                        <tr key={enr.enrollment_id || idx} className="border-b border-outline-variant/20 hover:bg-surface-variant/30 print:hover:bg-transparent">
                                          <td className="py-2 px-4 font-body text-on-surface font-medium">{student ? `${student.first_name} ${student.last_name}` : 'Unknown'}</td>
                                          <td className="py-2 px-4 font-body text-on-surface-variant">{student ? student.email : '-'}</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          );
                       })}
                     </div>
                   );
                })}

                {enrollments.length === 0 && (
                  <div className="py-6 text-center text-on-surface-variant">No enrollments found.</div>
                )}
              </div>
            )}

            {activeTab === 'attendance' && (
              <div>
                <p className="text-on-surface-variant mb-6 print:hidden">A report tracking student attendance (present/absent) and reasons for absence, filterable by date and teacher.</p>
                <div className="hidden print:flex justify-between items-end border-b-2 border-black pb-2 mb-6">
                   <h2 className="font-display text-2xl font-bold">Attendance Report</h2>
                   <span className="font-mono text-sm">{attendanceDate}</span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-6 print:hidden">
                   <div className="flex flex-col gap-2">
                     <label className="font-label text-sm font-bold text-on-surface-variant">Date</label>
                     <input 
                       type="date" 
                       value={attendanceDate}
                       onChange={e => setAttendanceDate(e.target.value)}
                       className="px-4 py-2 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface"
                     />
                   </div>
                   <div className="flex flex-col gap-2">
                     <label className="font-label text-sm font-bold text-on-surface-variant">Teacher Filter</label>
                     <select 
                       value={attendanceTeacherFilter}
                       onChange={e => setAttendanceTeacherFilter(e.target.value)}
                       className="px-4 py-2 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface"
                     >
                        <option value="all">All Teachers</option>
                        {teachers.map(t => (
                           <option key={t.user_id} value={t.user_id}>{t.first_name} {t.last_name}</option>
                        ))}
                     </select>
                   </div>
                </div>
                
                {attendanceLoading ? (
                   <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
                ) : (
                   <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                       <thead>
                         <tr className="border-b border-outline-variant/50">
                           <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Student</th>
                           <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Class</th>
                           <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Teacher</th>
                           <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Status</th>
                           <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Reason (Notes)</th>
                         </tr>
                       </thead>
                       <tbody>
                         {attendanceRecords
                           .filter(att => attendanceTeacherFilter === 'all' || att.classes?.primary_teacher_id === attendanceTeacherFilter)
                           .map(att => {
                             const teacher = teachers.find(t => t.user_id === att.classes?.primary_teacher_id);
                             return (
                               <tr key={att.attendance_id} className="border-b border-outline-variant/20 hover:bg-surface-variant/30 print:border-b-black/20">
                                 <td className="py-3 px-4 font-body text-sm font-medium text-on-surface">
                                    {att.users ? `${att.users.first_name} ${att.users.last_name}` : 'Unknown Student'}
                                 </td>
                                 <td className="py-3 px-4 font-body text-sm text-on-surface-variant">
                                    {att.classes?.class_name || att.classes?.name || 'Unknown Class'}
                                 </td>
                                 <td className="py-3 px-4 font-body text-sm text-on-surface-variant">
                                    {teacher ? formatTeacherName(teacher.first_name, teacher.last_name) : 'Unknown Teacher'}
                                 </td>
                                 <td className="py-3 px-4 font-body text-sm">
                                    <span className={`px-2 py-1 rounded-md font-label text-xs font-bold uppercase ${
                                       att.status === 'Present' ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'
                                    }`}>
                                      {att.status || 'Not Set'}
                                    </span>
                                 </td>
                                 <td className="py-3 px-4 font-body text-sm text-on-surface-variant max-w-xs truncate" title={att.notes || ''}>
                                    {att.notes || '-'}
                                 </td>
                               </tr>
                             );
                           })}
                           
                         {attendanceRecords.filter(att => attendanceTeacherFilter === 'all' || att.classes?.primary_teacher_id === attendanceTeacherFilter).length === 0 && (
                           <tr>
                             <td colSpan={5} className="py-6 text-center text-on-surface-variant">No attendance records found for this date.</td>
                           </tr>
                         )}
                       </tbody>
                     </table>
                   </div>
                )}
              </div>
            )}

            {activeTab === 'credentials' && (
              <div>
                <p className="text-on-surface-variant mb-6 print:hidden">A secure report listing usernames and passwords for all users, grouped by their assigned classes.</p>
                <div className="hidden print:flex justify-between items-end border-b-2 border-black pb-2 mb-6">
                   <h2 className="font-display text-2xl font-bold">User Credentials Report</h2>
                   <span className="font-mono text-sm">{new Date().toLocaleDateString()}</span>
                </div>
                
                {classes.map(cls => {
                   const classEnrollments = enrollments.filter(e => String(e.class_id) === String(cls.class_id));
                   
                   let teacher = teachers.find(t => t.user_id === cls.primary_teacher_id);
                   // In case users object is populated in the class record
                   if (!teacher && cls.users) {
                     teacher = { ...cls.users, user_id: cls.primary_teacher_id, user_name: cls.users.user_name, password_hash: cls.users.password_hash };
                   }
                   
                   return (
                     <div key={cls.class_id} className="mb-8">
                       <h3 className="font-display text-xl font-bold mb-4 px-3 py-2 bg-surface-container rounded-lg border border-outline-variant/30 text-on-surface">
                         {cls.class_name || cls.name || 'Unnamed Class'}
                       </h3>
                       
                       <div className="overflow-x-auto ml-4">
                         <table className="w-full text-left border-collapse border border-outline-variant/30 shadow-sm rounded-lg overflow-hidden">
                           <thead className="bg-surface-container-low">
                             <tr className="border-b border-outline-variant/50">
                               <th className="py-3 px-4 font-label font-bold text-xs text-on-surface-variant uppercase tracking-wider">Role</th>
                               <th className="py-3 px-4 font-label font-bold text-xs text-on-surface-variant uppercase tracking-wider">Name</th>
                               <th className="py-3 px-4 font-label font-bold text-xs text-on-surface-variant uppercase tracking-wider">Username</th>
                               <th className="py-3 px-4 font-label font-bold text-xs text-on-surface-variant uppercase tracking-wider">Password</th>
                             </tr>
                           </thead>
                           <tbody>
                             {teacher && (
                               <tr className="border-b border-outline-variant/20 hover:bg-surface-variant/30 print:hover:bg-transparent bg-primary/5">
                                 <td className="py-2 px-4 font-label text-sm text-primary font-bold">Teacher</td>
                                 <td className="py-2 px-4 font-body text-sm text-on-surface font-medium">{formatTeacherName(teacher.first_name, teacher.last_name)}</td>
                                 <td className="py-2 px-4 font-mono text-sm text-on-surface-variant">{teacher.user_name || '-'}</td>
                                 <td className="py-2 px-4 font-mono text-sm text-on-surface-variant">{teacher.password_hash || '-'}</td>
                               </tr>
                             )}
                             
                             {classEnrollments.map((enr, idx) => {
                               const student = students.find(s => String(s.user_id) === String(enr.student_id));
                               if (!student) return null;
                               return (
                                 <tr key={enr.enrollment_id || idx} className="border-b border-outline-variant/20 hover:bg-surface-variant/30 print:hover:bg-transparent">
                                   <td className="py-2 px-4 font-label text-sm text-on-surface-variant">Student</td>
                                   <td className="py-2 px-4 font-body text-sm text-on-surface">{student.first_name} {student.last_name}</td>
                                   <td className="py-2 px-4 font-mono text-sm text-on-surface-variant">{student.user_name || '-'}</td>
                                   <td className="py-2 px-4 font-mono text-sm text-on-surface-variant">{student.password_hash || '-'}</td>
                                 </tr>
                               );
                             })}
                             
                             {!teacher && classEnrollments.length === 0 && (
                               <tr>
                                 <td colSpan={4} className="py-4 text-center text-on-surface-variant text-sm">No users found for this class.</td>
                               </tr>
                             )}
                           </tbody>
                         </table>
                       </div>
                     </div>
                   );
                })}

                {classes.length === 0 && (
                  <div className="py-6 text-center text-on-surface-variant">No classes found.</div>
                )}
                
                {(() => {
                   const primaryTeacherIds = new Set(classes.map(c => c.primary_teacher_id));
                   const otherTeachers = teachers.filter(t => !primaryTeacherIds.has(t.user_id));
                   
                   if (otherTeachers.length > 0 || volunteers.length > 0) {
                     return (
                       <div className="mb-8 mt-12 border-t border-outline-variant/30 pt-8 print:mt-8 print:pt-4">
                         <h3 className="font-display text-xl font-bold mb-4 px-3 py-2 bg-surface-container rounded-lg border border-outline-variant/30 text-on-surface">
                           Support Staff & Volunteers
                         </h3>
                         
                         <div className="overflow-x-auto ml-4">
                           <table className="w-full text-left border-collapse border border-outline-variant/30 shadow-sm rounded-lg overflow-hidden">
                             <thead className="bg-surface-container-low">
                               <tr className="border-b border-outline-variant/50">
                                 <th className="py-3 px-4 font-label font-bold text-xs text-on-surface-variant uppercase tracking-wider">Role</th>
                                 <th className="py-3 px-4 font-label font-bold text-xs text-on-surface-variant uppercase tracking-wider">Name</th>
                                 <th className="py-3 px-4 font-label font-bold text-xs text-on-surface-variant uppercase tracking-wider">Username</th>
                                 <th className="py-3 px-4 font-label font-bold text-xs text-on-surface-variant uppercase tracking-wider">Password</th>
                               </tr>
                             </thead>
                             <tbody>
                               {otherTeachers.map(teacher => (
                                 <tr key={teacher.user_id} className="border-b border-outline-variant/20 hover:bg-surface-variant/30 print:hover:bg-transparent bg-primary/5">
                                   <td className="py-2 px-4 font-label text-sm text-primary font-bold">Teacher (Unassigned)</td>
                                   <td className="py-2 px-4 font-body text-sm text-on-surface font-medium">{formatTeacherName(teacher.first_name, teacher.last_name)}</td>
                                   <td className="py-2 px-4 font-mono text-sm text-on-surface-variant">{teacher.user_name || '-'}</td>
                                   <td className="py-2 px-4 font-mono text-sm text-on-surface-variant">{teacher.password_hash || '-'}</td>
                                 </tr>
                               ))}
                               
                               {volunteers.map(volunteer => (
                                 <tr key={volunteer.user_id} className="border-b border-outline-variant/20 hover:bg-surface-variant/30 print:hover:bg-transparent bg-amber-500/5">
                                   <td className="py-2 px-4 font-label text-sm text-amber-600 font-bold">Volunteer</td>
                                   <td className="py-2 px-4 font-body text-sm text-on-surface font-medium">{volunteer.first_name} {volunteer.last_name}</td>
                                   <td className="py-2 px-4 font-mono text-sm text-on-surface-variant">{volunteer.user_name || '-'}</td>
                                   <td className="py-2 px-4 font-mono text-sm text-on-surface-variant">{volunteer.password_hash || '-'}</td>
                                 </tr>
                               ))}
                             </tbody>
                           </table>
                         </div>
                       </div>
                     );
                   }
                   return null;
                })()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
