import { useState, useEffect } from "react";
import { Printer, Download, Users, School, BookOpen, ClipboardList } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState<'teachers' | 'students' | 'classes' | 'enrollments'>('teachers');
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
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
           
           if (teacherRole) {
             const teacherIds = userRolesData.filter((ur: any) => ur.role_id === teacherRole.role_id).map((ur: any) => ur.user_id);
             setTeachers(usersData.filter((u: any) => teacherIds.includes(u.user_id)));
           }
           
           if (studentRole) {
             const studentIds = userRolesData.filter((ur: any) => ur.role_id === studentRole.role_id).map((ur: any) => ur.user_id);
             setStudents(usersData.filter((u: any) => studentIds.includes(u.user_id)));
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 w-full max-w-7xl mx-auto h-full overflow-hidden print:overflow-visible print:h-auto print:p-0">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 print:hidden">
        <div>
           <h1 className="font-display text-3xl text-primary font-bold tracking-tight">System Reports</h1>
           <p className="font-body text-on-surface-variant mt-1">View and print data reports for teachers, students, and classes.</p>
        </div>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-full font-label font-bold hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Printer className="w-5 h-5" />
          Print Report
        </button>
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
      </div>

      <div className="flex-1 overflow-auto bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-sm print:border-none print:shadow-none print:bg-white print:overflow-visible">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="p-6 print:p-0">
            {activeTab === 'teachers' && (
              <div>
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
                          <td className="py-3 px-4 font-body text-on-surface font-medium">{teacher.first_name} {teacher.last_name}</td>
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
                              if (cls.users) return `${cls.users.first_name} ${cls.users.last_name}`;
                              const teacher = teachers.find(t => t.user_id === cls.primary_teacher_id);
                              return teacher ? `${teacher.first_name} ${teacher.last_name}` : 'Unassigned';
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
                               teacherName = `${cls.users.first_name} ${cls.users.last_name}`;
                             } else {
                               const teacher = teachers.find(t => t.user_id === cls.primary_teacher_id);
                               if (teacher) teacherName = `${teacher.first_name} ${teacher.last_name}`;
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
          </div>
        )}
      </div>
    </div>
  );
}
