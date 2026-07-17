import { useState, useEffect } from "react";
import { Printer, Download, Users, School, BookOpen, ClipboardList, KeyRound, CheckSquare, Clock, Fingerprint } from "lucide-react";
import { supabase } from "../lib/supabase";
import { formatTeacherName } from "../lib/utils";
import { ReportPrintHeader } from "../components/admin/ReportPrintHeader";
import { jsPDF } from "jspdf";


export default function AdminReports() {
  const [activeTab, setActiveTab] = useState<'teachers' | 'students' | 'classes' | 'enrollments' | 'attendance' | 'credentials' | 'login_history' | 'checkin_history' | 'staff_attendance'>('teachers');
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [loginLogs, setLoginLogs] = useState<any[]>([]);
  const [checkinLogs, setCheckinLogs] = useState<any[]>([]);
  const [staffClockLogs, setStaffClockLogs] = useState<any[]>([]);
  const [staffAttendanceDate, setStaffAttendanceDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [staffClockLogsLoading, setStaffClockLogsLoading] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [loginDate, setLoginDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [checkinDate, setCheckinDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [loginSortBy, setLoginSortBy] = useState<'time' | 'user'>('time');
  const [attendanceTeacherFilter, setAttendanceTeacherFilter] = useState('all');
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [loginLogsLoading, setLoginLogsLoading] = useState(false);
  const [checkinLogsLoading, setCheckinLogsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Fetch all data
        const { data: usersData } = await supabase.from('users').select('user_id, first_name, last_name, email');
        const { data: rolesData } = await supabase.from('roles').select('role_id, role_name');
        const { data: userRolesData } = await supabase.from('user_roles').select('user_id, role_id');
        const { data: classData, error: classError } = await supabase.from('classes').select('class_id, class_name, program_id');
        if (classError) console.error("Class fetch error:", classError);
        const { data: enrollmentsData, error: enrollmentsError } = await supabase.from('enrollments').select('enrollment_id, student_id, class_id, status, program_id');
        if (enrollmentsError) console.error("Enrollments fetch error:", enrollmentsError);
        const { data: programsData } = await supabase.from('programs').select('program_id, program_name');
        
        if (enrollmentsData) {
          setEnrollments(enrollmentsData);
        }
        if (programsData) {
          setPrograms(programsData);
        }

        if (usersData && rolesData && userRolesData && usersData.length > 0) {
           setAllUsers(usersData);
           const teacherRole = rolesData.find((r: any) => r.role_name.toLowerCase() === 'teacher');
           const studentRole = rolesData.find((r: any) => r.role_name.toLowerCase() === 'student');
           const volunteerRole = rolesData.find((r: any) => r.role_name.toLowerCase() === 'volunteer');
           
           if (teacherRole) {
             const teacherIds = userRolesData.filter((ur: any) => ur.role_id === teacherRole.role_id).map((ur: any) => ur.user_id);
             setTeachers(usersData.filter((u: any) => teacherIds.includes(u.user_id) && !(u.first_name === 'Youlin' && u.last_name === 'Venerable')).sort((a, b) => (a.first_name || '').localeCompare(b.first_name || '')));
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

  useEffect(() => {
    if (activeTab === 'login_history') {
       fetchLoginLogs();
    }
  }, [activeTab, loginDate]);

  useEffect(() => {
    if (activeTab === 'checkin_history') {
       fetchCheckinLogs();
    }
  }, [activeTab, checkinDate]);

  useEffect(() => {
    if (activeTab === 'staff_attendance') {
       fetchStaffClockLogs();
    }
  }, [activeTab, staffAttendanceDate]);

  async function fetchStaffClockLogs() {
     setStaffClockLogsLoading(true);
     const [year, month, day] = staffAttendanceDate.split('-').map(Number);
     const startOfDay = new Date(year, month - 1, day);
     startOfDay.setHours(0, 0, 0, 0);
     const endOfDay = new Date(year, month - 1, day);
     endOfDay.setHours(23, 59, 59, 999);
     
     const { data, error } = await supabase
       .from('staff_clock_ins')
       .select('*, users(first_name, last_name, email)')
       .gte('created_at', startOfDay.toISOString())
       .lte('created_at', endOfDay.toISOString())
       .order('created_at', { ascending: false });
       
     if (data) {
       setStaffClockLogs(data);
     } else if (error) {
       console.error("Staff clock logs fetch error:", error);
     }
     setStaffClockLogsLoading(false);
  }

  async function fetchCheckinLogs() {
     setCheckinLogsLoading(true);
     const [year, month, day] = checkinDate.split('-').map(Number);
     const startOfDay = new Date(year, month - 1, day);
     startOfDay.setHours(0, 0, 0, 0);
     const endOfDay = new Date(year, month - 1, day);
     endOfDay.setHours(23, 59, 59, 999);
     
     const { data, error } = await supabase
       .from('student_clock_ins')
       .select('*, users!student_id(first_name, last_name, email)')
       .gte('created_at', startOfDay.toISOString())
       .lte('created_at', endOfDay.toISOString())
       .order('created_at', { ascending: false });
       
     if (data) {
       setCheckinLogs(data);
     } else if (error) {
       console.error("Checkin logs fetch error:", error);
     }
     setCheckinLogsLoading(false);
  }


  async function fetchLoginLogs() {
     setLoginLogsLoading(true);
     const [year, month, day] = loginDate.split('-').map(Number);
     const startOfDay = new Date(year, month - 1, day);
     startOfDay.setHours(0, 0, 0, 0);
     const endOfDay = new Date(year, month - 1, day);
     endOfDay.setHours(23, 59, 59, 999);
     
     const { data, error } = await supabase
       .from('system_logs')
       .select('*')
       .eq('action_type', 'login')
       .gte('created_at', startOfDay.toISOString())
       .lte('created_at', endOfDay.toISOString())
       .order('created_at', { ascending: false });
       
     if (data) {
       setLoginLogs(data);
     } else if (error) {
       console.error("Login logs fetch error:", error);
     }
     setLoginLogsLoading(false);
  }

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
    <div className="p-6 md:p-8 flex flex-col gap-6 w-full max-w-7xl mx-auto h-full overflow-hidden print:overflow-visible print:h-auto print:p-0 print:block">
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

      <div className="flex flex-wrap bg-surface-container-low p-1 rounded-2xl w-full sm:w-fit shrink-0 print:hidden gap-1">
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
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-label font-bold text-sm transition-all ${
            activeTab === 'attendance' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <CheckSquare className="w-4 h-4" /> Attendance
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
          onClick={() => setActiveTab('staff_attendance')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-label font-bold text-sm transition-all ${
            activeTab === 'staff_attendance' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Clock className="w-4 h-4" /> Staff Attendance
        </button>
        <button
          onClick={() => setActiveTab('login_history')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-label font-bold text-sm transition-all ${
            activeTab === 'login_history' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Clock className="w-4 h-4" /> Login History
        </button>
        <button
          onClick={() => setActiveTab('checkin_history')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-label font-bold text-sm transition-all ${
            activeTab === 'checkin_history' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Fingerprint className="w-4 h-4" /> Building Check-ins
        </button>
      </div>

      <div id="report-content-area" className="flex-1 overflow-auto bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-sm print:border-none print:shadow-none print:bg-white print:overflow-visible print:block print:h-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="p-6 print:p-0 print:block">
            {activeTab === 'teachers' && (
              <div>
                <ReportPrintHeader title="Teachers Report" />
                <div className="flex flex-col gap-2 mb-6 print:hidden">
                   <div className="flex justify-between items-end border-b border-outline-variant/30 pb-4">
                       <h2 className="font-display text-2xl font-bold text-on-surface">Teachers Report</h2>
                       <span className="font-mono text-sm text-on-surface-variant">{new Date().toLocaleDateString()}</span>
                   </div>
                   <p className="text-on-surface-variant">A comprehensive list of all teachers currently active in the system, including contact details.</p>
                </div>
                <div className="overflow-x-auto print:overflow-visible rounded-xl border border-outline-variant/30 shadow-sm bg-surface">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-surface-container-low print:bg-transparent print:border-t print:border-black/20">
                      <tr className="border-b border-outline-variant/50 print:border-b-black/20">
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Name</th>
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Email</th>
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Classes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teachers.map((teacher, idx) => {
                        const teacherClasses = classes.filter(c => String(c.primary_teacher_id) === String(teacher.user_id)).map(c => c.name || c.class_name);
                        return (
                        <tr key={teacher.user_id || idx} className="border-b border-outline-variant/20 hover:bg-surface-variant/30 print:hover:bg-transparent print:break-inside-avoid">
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
                <ReportPrintHeader title="Students Report" />
                <div className="flex flex-col gap-2 mb-6 print:hidden">
                   <div className="flex justify-between items-end border-b border-outline-variant/30 pb-4">
                       <h2 className="font-display text-2xl font-bold text-on-surface">Students Report</h2>
                       <span className="font-mono text-sm text-on-surface-variant">{new Date().toLocaleDateString()}</span>
                   </div>
                   <p className="text-on-surface-variant">A complete directory of all enrolled students, detailing grade levels and contact information.</p>
                </div>
                <div className="overflow-x-auto print:overflow-visible rounded-xl border border-outline-variant/30 shadow-sm bg-surface">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-surface-container-low print:bg-transparent print:border-t print:border-black/20">
                      <tr className="border-b border-outline-variant/50 print:border-b-black/20">
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
                        <tr key={student.user_id || idx} className="border-b border-outline-variant/20 hover:bg-surface-variant/30 print:hover:bg-transparent print:break-inside-avoid">
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
                <ReportPrintHeader title="Classes Report" />
                <div className="flex flex-col gap-2 mb-6 print:hidden">
                   <div className="flex justify-between items-end border-b border-outline-variant/30 pb-4">
                       <h2 className="font-display text-2xl font-bold text-on-surface">Classes Report</h2>
                       <span className="font-mono text-sm text-on-surface-variant">{new Date().toLocaleDateString()}</span>
                   </div>
                   <p className="text-on-surface-variant">An overview of all active classes, showing assigned teachers, locations, and schedules.</p>
                </div>
                <div className="overflow-x-auto print:overflow-visible rounded-xl border border-outline-variant/30 shadow-sm bg-surface">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-surface-container-low print:bg-transparent print:border-t print:border-black/20">
                      <tr className="border-b border-outline-variant/50 print:border-b-black/20">
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Class Name</th>
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Room</th>
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Primary Teacher</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classes.map((cls, idx) => (
                        <tr key={cls.class_id || idx} className="border-b border-outline-variant/20 hover:bg-surface-variant/30 print:hover:bg-transparent print:break-inside-avoid">
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
                <ReportPrintHeader title="Enrollments Report" />
                <div className="flex flex-col gap-2 mb-6 print:hidden">
                   <div className="flex justify-between items-end border-b border-outline-variant/30 pb-4">
                       <h2 className="font-display text-2xl font-bold text-on-surface">Enrollments Report</h2>
                       <span className="font-mono text-sm text-on-surface-variant">{new Date().toLocaleDateString()}</span>
                   </div>
                   <p className="text-on-surface-variant">A detailed breakdown of student enrollments grouped by class, including unassigned students.</p>
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
                          
                          const enrolledTeachers = classEnrollments
                            .filter((enr: any) => teachers.some(t => String(t.user_id) === String(enr.student_id)))
                            .map((enr: any) => teachers.find(t => String(t.user_id) === String(enr.student_id)));

                          const enrolledVolunteers = classEnrollments
                            .filter((enr: any) => volunteers.some(v => String(v.user_id) === String(enr.student_id)))
                            .map((enr: any) => volunteers.find(v => String(v.user_id) === String(enr.student_id)));

                          const studentEnrollments = classEnrollments
                            .filter((enr: any) => students.some(s => String(s.user_id) === String(enr.student_id)) || (!teachers.some(t => String(t.user_id) === String(enr.student_id)) && !volunteers.some(v => String(v.user_id) === String(enr.student_id))));

                          let allTeacherNames: string[] = [];
                          if (cls && cls.primary_teacher_id) {
                            const primaryT = teachers.find(t => String(t.user_id) === String(cls.primary_teacher_id));
                            if (primaryT) {
                              allTeacherNames.push(formatTeacherName(primaryT.first_name, primaryT.last_name));
                            } else if (cls.users) {
                              allTeacherNames.push(formatTeacherName(cls.users.first_name, cls.users.last_name));
                            }
                          }
                          
                          enrolledTeachers.forEach((t: any) => {
                            if (t) {
                              const name = formatTeacherName(t.first_name, t.last_name);
                              if (!allTeacherNames.includes(name)) allTeacherNames.push(name);
                            }
                          });
                          
                          const teacherNameStr = allTeacherNames.length > 0 ? allTeacherNames.join(", ") : 'Unassigned';
                          const volunteerNameStr = enrolledVolunteers.map((v: any) => v ? `${v.first_name || ''} ${v.last_name || ''}`.trim() : '').filter(Boolean).join(", ");

                          return (
                            <div key={classId} className="mb-6 ml-4">
                              <h4 className="font-label font-bold text-lg mb-2 text-on-surface flex justify-between items-end border-b border-outline-variant/30 pb-1">
                                <span>{cls ? (cls.class_name || cls.name) : 'Unassigned Class'}</span>
                                <div className="text-right flex flex-col">
                                   <span className="text-sm font-normal text-on-surface-variant">Teacher(s): {teacherNameStr}</span>
                                   {volunteerNameStr && <span className="text-xs font-normal text-on-surface-variant/80">Volunteer(s): {volunteerNameStr}</span>}
                                </div>
                              </h4>
                              <div className="overflow-x-auto print:overflow-visible rounded-xl border border-outline-variant/30 shadow-sm bg-surface">
                                <table className="w-full text-left border-collapse">
                                  <thead className="bg-surface-container-low print:bg-transparent print:border-t print:border-black/20">
                                    <tr className="border-b border-outline-variant/50 print:border-b-black/20">
                                      <th className="py-2 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Student Name</th>
                                      <th className="py-2 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Student Email</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {studentEnrollments.map((enr: any, idx: number) => {
                                      const student = students.find(s => String(s.user_id) === String(enr.student_id));
                                      return (
                                        <tr key={enr.enrollment_id || idx} className="border-b border-outline-variant/20 hover:bg-surface-variant/30 print:hover:bg-transparent print:break-inside-avoid">
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
                <ReportPrintHeader title={`Attendance Report - ${attendanceDate}`} />
                <div className="flex flex-col gap-2 mb-6 print:hidden">
                   <div className="flex justify-between items-end border-b border-outline-variant/30 pb-4">
                       <h2 className="font-display text-2xl font-bold text-on-surface">Attendance Report</h2>
                       <span className="font-mono text-sm text-on-surface-variant">{attendanceDate}</span>
                   </div>
                   <p className="text-on-surface-variant">A report tracking student attendance (present/absent) and reasons for absence, filterable by date and teacher.</p>
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
                           <option key={t.user_id} value={t.user_id}>{formatTeacherName(t.first_name, t.last_name)}</option>
                        ))}
                     </select>
                   </div>
                </div>
                
                {attendanceLoading ? (
                   <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
                ) : (
                   <div className="overflow-x-auto print:overflow-visible rounded-xl border border-outline-variant/30 shadow-sm bg-surface">
                     <table className="w-full text-left border-collapse">
                       <thead className="bg-surface-container-low print:bg-transparent print:border-t print:border-black/20">
                         <tr className="border-b border-outline-variant/50 print:border-b-black/20">
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
                               <tr key={att.attendance_id} className="border-b border-outline-variant/20 hover:bg-surface-variant/30 print:border-b-black/20 print:break-inside-avoid">
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
                                       att.status === 'Present' ? 'bg-primary/10 text-primary' : att.status === 'Late' ? 'bg-yellow-500/10 text-yellow-600' : 'bg-error/10 text-error'
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
              <div className="space-y-8">
                
                {/* Students Section */}
                <div className="overflow-x-auto print:overflow-visible rounded-xl border border-outline-variant/30 shadow-sm bg-surface print:break-inside-avoid">
                  <div className="bg-surface-container-low p-4 border-b border-outline-variant/30">
                    <h3 className="font-display text-lg font-bold text-on-surface">Students</h3>
                    <p className="text-sm text-on-surface-variant font-body mt-1">Student Credentials</p>
                  </div>
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-surface-container-lowest print:bg-transparent print:border-t print:border-black/20">
                      <tr className="border-b border-outline-variant/50 print:border-b-black/20">
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Name</th>
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Username</th>
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Email</th>
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Password</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((user, idx) => (
                        <tr key={user.user_id || idx} className="border-b border-outline-variant/20 hover:bg-surface-variant/30 print:border-b-black/20 print:break-inside-avoid">
                          <td className="py-3 px-4 font-body text-sm font-medium text-on-surface">{user.first_name} {user.last_name}</td>
                          <td className="py-3 px-4 font-body text-sm text-on-surface-variant">{user.user_name || '-'}</td>
                          <td className="py-3 px-4 font-body text-sm text-on-surface-variant">{user.email || '-'}</td>
                          <td className="py-3 px-4 font-body text-sm text-on-surface-variant">{user.password_hash || 'Not Set'}</td>
                        </tr>
                      ))}
                      {students.length === 0 && (
                        <tr><td colSpan={4} className="py-6 text-center text-on-surface-variant">No students found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Teachers Section */}
                <div className="overflow-x-auto print:overflow-visible rounded-xl border border-outline-variant/30 shadow-sm bg-surface print:break-inside-avoid">
                  <div className="bg-surface-container-low p-4 border-b border-outline-variant/30">
                    <h3 className="font-display text-lg font-bold text-on-surface">Teachers</h3>
                    <p className="text-sm text-on-surface-variant font-body mt-1">Teacher Credentials</p>
                  </div>
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-surface-container-lowest print:bg-transparent print:border-t print:border-black/20">
                      <tr className="border-b border-outline-variant/50 print:border-b-black/20">
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Name</th>
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Username</th>
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Email</th>
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Password</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teachers.map((user, idx) => (
                        <tr key={user.user_id || idx} className="border-b border-outline-variant/20 hover:bg-surface-variant/30 print:border-b-black/20 print:break-inside-avoid">
                          <td className="py-3 px-4 font-body text-sm font-medium text-on-surface">{user.first_name} {user.last_name}</td>
                          <td className="py-3 px-4 font-body text-sm text-on-surface-variant">{user.user_name || '-'}</td>
                          <td className="py-3 px-4 font-body text-sm text-on-surface-variant">{user.email || '-'}</td>
                          <td className="py-3 px-4 font-body text-sm text-on-surface-variant">{user.password_hash || 'Not Set'}</td>
                        </tr>
                      ))}
                      {teachers.length === 0 && (
                        <tr><td colSpan={4} className="py-6 text-center text-on-surface-variant">No teachers found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Other Users / Staff Section */}
                <div className="overflow-x-auto print:overflow-visible rounded-xl border border-outline-variant/30 shadow-sm bg-surface print:break-inside-avoid">
                  <div className="bg-surface-container-low p-4 border-b border-outline-variant/30">
                    <h3 className="font-display text-lg font-bold text-on-surface">Staff & Other Users</h3>
                    <p className="text-sm text-on-surface-variant font-body mt-1">Volunteers and Administrators</p>
                  </div>
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-surface-container-lowest print:bg-transparent print:border-t print:border-black/20">
                      <tr className="border-b border-outline-variant/50 print:border-b-black/20">
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Name</th>
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Username</th>
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Role</th>
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Email</th>
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Password</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers.filter(u => {
                        const isStudent = students.some(s => s.user_id === u.user_id);
                        const isTeacher = teachers.some(t => t.user_id === u.user_id);
                        return !isStudent && !isTeacher;
                      }).map((user, idx) => {
                         const isVolunteer = volunteers.some(v => v.user_id === user.user_id);
                         const role = isVolunteer ? 'Volunteer' : 'Staff / Other';
                         
                         return (
                           <tr key={user.user_id || idx} className="border-b border-outline-variant/20 hover:bg-surface-variant/30 print:border-b-black/20 print:break-inside-avoid">
                             <td className="py-3 px-4 font-body text-sm font-medium text-on-surface">{user.first_name} {user.last_name}</td>
                             <td className="py-3 px-4 font-body text-sm text-on-surface-variant">{user.user_name || '-'}</td>
                             <td className="py-3 px-4 font-body text-sm text-on-surface-variant">{role}</td>
                             <td className="py-3 px-4 font-body text-sm text-on-surface-variant">{user.email || '-'}</td>
                             <td className="py-3 px-4 font-body text-sm text-on-surface-variant">{user.password_hash || 'Not Set'}</td>
                           </tr>
                         );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {activeTab === 'checkin_history' && (
              <div>
                <ReportPrintHeader title={`Building Check-ins - ${checkinDate}`} />
                <div className="flex flex-col gap-2 mb-6 print:hidden">
                   <div className="flex justify-between items-end border-b border-outline-variant/30 pb-4">
                       <h2 className="font-display text-2xl font-bold text-on-surface">Building Check-ins</h2>
                       <span className="font-mono text-sm text-on-surface-variant">{checkinDate}</span>
                   </div>
                   <p className="text-on-surface-variant">A report tracking building check-ins/outs via the QR Scanner.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-6 print:hidden">
                   <div className="flex flex-col gap-2">
                     <label className="font-label text-sm font-bold text-on-surface-variant">Date</label>
                     <input
                        type="date"
                        value={checkinDate}
                       onChange={e => setCheckinDate(e.target.value)}
                       className="px-4 py-2 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface"
                     />
                   </div>
                </div>
                
                {checkinLogsLoading ? (
                   <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
                ) : (
                   <div className="overflow-x-auto print:overflow-visible rounded-xl border border-outline-variant/30 shadow-sm bg-surface">
                     <table className="w-full text-left border-collapse">
                       <thead className="bg-surface-container-low print:bg-transparent print:border-t print:border-black/20">
                         <tr>
                           <th className="py-3 px-4 font-label font-bold text-on-surface-variant">Time</th>
                           <th className="py-3 px-4 font-label font-bold text-on-surface-variant">Student</th>
                           <th className="py-3 px-4 font-label font-bold text-on-surface-variant">Action</th>
                           <th className="py-3 px-4 font-label font-bold text-on-surface-variant">Daily Status</th>
                         </tr>
                       </thead>
                       <tbody>
                         {checkinLogs.map(log => (
                           <tr key={log.id} className="border-b border-outline-variant/20 hover:bg-surface-variant/30 print:border-b-black/20 print:break-inside-avoid">
                             <td className="py-3 px-4 font-body text-sm text-on-surface-variant whitespace-nowrap">
                                {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </td>
                             <td className="py-3 px-4 font-body text-sm font-medium text-on-surface">
                                {log.users ? `${log.users.first_name} ${log.users.last_name}` : 'Unknown Student'}
                             </td>
                             <td className="py-3 px-4 font-body text-sm text-on-surface-variant capitalize">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${log.action_type.includes('in') ? 'bg-primary-container text-on-primary-container' : 'bg-secondary-container text-on-secondary-container'}`}>
                                   {log.action_type.replace('school_', '').replace(/_/g, ' ')}
                                </span>
                             </td>
                             <td className="py-3 px-4 font-body text-sm text-on-surface-variant capitalize">
                                <span className="px-2 py-1 rounded text-xs font-bold bg-surface-variant text-on-surface-variant">
                                   {log.daily_status || 'not arrive yet'}
                                </span>
                             </td>
                           </tr>
                         ))}
                         {checkinLogs.length === 0 && (
                           <tr>
                             <td colSpan={3} className="py-6 text-center text-on-surface-variant">No check-in records found for this date.</td>
                           </tr>
                         )}
                       </tbody>
                     </table>
                   </div>
                )}
              </div>
            )}
            
            {activeTab === 'staff_attendance' && (
              <div>
                <ReportPrintHeader title={`Staff Attendance Report - ${staffAttendanceDate}`} />
                <div className="flex flex-col gap-2 mb-6 print:hidden">
                   <div className="flex justify-between items-end border-b border-outline-variant/30 pb-4">
                       <h2 className="font-display text-2xl font-bold text-on-surface">Staff Attendance Report</h2>
                       <span className="font-mono text-sm text-on-surface-variant">{staffAttendanceDate}</span>
                   </div>
                   <p className="text-on-surface-variant">A report tracking staff clock-ins and clock-outs.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-6 print:hidden">
                   <div className="flex flex-col gap-2">
                     <label className="font-label text-sm font-bold text-on-surface-variant">Date</label>
                     <input
                        type="date"
                        value={staffAttendanceDate}
                       onChange={e => setStaffAttendanceDate(e.target.value)}
                       className="px-4 py-2 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface"
                     />
                   </div>
                </div>

                {staffClockLogsLoading ? (
                   <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
                ) : (
                   <div className="overflow-x-auto print:overflow-visible rounded-xl border border-outline-variant/30 shadow-sm bg-surface">
                     <table className="w-full text-left border-collapse">
                       <thead className="bg-surface-container-low print:bg-transparent print:border-t print:border-black/20">
                         <tr>
                           <th className="py-3 px-4 font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant">Time</th>
                           <th className="py-3 px-4 font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant">Staff Name</th>
                           <th className="py-3 px-4 font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant">Action</th>
                           <th className="py-3 px-4 font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant">Daily Status</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-outline-variant/20">
                         {staffClockLogs.map(log => (
                           <tr key={log.id} className="border-b border-outline-variant/20 hover:bg-surface-variant/30 print:border-b-black/20 print:break-inside-avoid">
                             <td className="py-3 px-4 font-body text-sm text-on-surface-variant whitespace-nowrap">
                                {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </td>
                             <td className="py-3 px-4 font-body text-sm font-medium text-on-surface">
                                {log.users ? formatTeacherName(log.users.first_name, log.users.last_name, 'Teacher') : 'Unknown Staff'}
                             </td>
                             <td className="py-3 px-4 font-body text-sm text-on-surface-variant capitalize">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${log.action_type === 'clock_in' ? 'bg-primary-container text-on-primary-container' : 'bg-secondary-container text-on-secondary-container'}`}>
                                   {log.action_type.replace('_', ' ')}
                                </span>
                             </td>
                             <td className="py-3 px-4 font-body text-sm text-on-surface-variant capitalize">
                                <span className="px-2 py-1 rounded text-xs font-bold bg-surface-variant text-on-surface-variant">
                                   {log.daily_status || 'not arrive yet'}
                                </span>
                             </td>
                           </tr>
                         ))}
                         {staffClockLogs.length === 0 && (
                           <tr>
                             <td colSpan={3} className="py-6 text-center text-on-surface-variant">No staff attendance records found for this date.</td>
                           </tr>
                         )}
                       </tbody>
                     </table>
                   </div>
                )}
              </div>
            )}

            {activeTab === 'login_history' && (
              <div>
                <ReportPrintHeader title="LOGIN HISTORY REPORT" />
                <div className="flex flex-col gap-2 mb-6 print:hidden">
                   <div className="flex justify-between items-end border-b border-outline-variant/30 pb-4">
                       <h2 className="font-display text-2xl font-bold text-on-surface">Login History Report</h2>
                       <span className="font-mono text-sm text-on-surface-variant">{loginDate}</span>
                   </div>
                   <p className="text-on-surface-variant">A report tracking when users logged into the system.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-6 print:hidden">
                   <div className="flex flex-col gap-2">
                     <label className="font-label text-sm font-bold text-on-surface-variant">Date</label>
                     <input 
                       type="date" 
                       value={loginDate}
                       onChange={e => setLoginDate(e.target.value)}
                       className="px-4 py-2 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface"
                     />
                   </div>
                   <div className="flex flex-col gap-2">
                     <label className="font-label text-sm font-bold text-on-surface-variant">Sort By</label>
                     <select
                       value={loginSortBy}
                       onChange={e => setLoginSortBy(e.target.value as 'time' | 'user')}
                       className="px-4 py-2 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface"
                     >
                       <option value="time">Login Time</option>
                       <option value="user">User Name</option>
                     </select>
                   </div>
                </div>
                
                {loginLogsLoading ? (
                   <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
                ) : (
                   <div className="overflow-x-auto print:overflow-visible rounded-xl border border-outline-variant/30 shadow-sm bg-surface">
                     <table className="w-full text-left border-collapse">
                       <thead className="bg-surface-container-low print:bg-transparent print:border-t print:border-black/20">
                         <tr className="border-b border-outline-variant/50 print:border-b-black/20">
                           <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Time</th>
                           <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Name</th>
                           <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Role</th>
                           <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Device</th>
                           <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">IP Address</th>
                         </tr>
                       </thead>
                       <tbody>
                         {[...loginLogs]
                           .sort((a, b) => {
                             if (loginSortBy === 'user') {
                               const nameA = a.user_name || '';
                               const nameB = b.user_name || '';
                               if (nameA !== nameB) return nameA.localeCompare(nameB);
                             }
                             return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                           })
                           .map(log => {
                             return (
                               <tr key={log.log_id || log.id} className="border-b border-outline-variant/20 hover:bg-surface-variant/30 print:border-b-black/20 print:break-inside-avoid">
                                 <td className="py-3 px-4 font-body text-sm text-on-surface">
                                    {new Date(log.created_at).toLocaleTimeString()}
                                 </td>
                                 <td className="py-3 px-4 font-body text-sm font-medium text-on-surface">
                                    {log.user_name || 'Unknown User'}
                                 </td>
                                 <td className="py-3 px-4 font-body text-sm text-on-surface-variant">
                                    {log.user_role || '-'}
                                 </td>
                                 <td className="py-3 px-4 font-body text-sm text-on-surface-variant">
                                    {log.browser || '-'}
                                 </td>
                                 <td className="py-3 px-4 font-body text-sm text-on-surface-variant max-w-xs truncate" title={log.ip_address || ''}>
                                    {log.ip_address || '-'}
                                 </td>
                               </tr>
                             );
                           })}
                           
                         {loginLogs.length === 0 && (
                           <tr>
                             <td colSpan={5} className="py-6 text-center text-on-surface-variant">No login records found for this date.</td>
                           </tr>
                         )}
                       </tbody>
                     </table>
                   </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
