import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { BookOpen, Plus, Save, X, Edit, Trash2, Calendar, FileText, CheckCircle2, Circle, Users, XCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export default function TeacherAssignmentBoard() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialClassId = searchParams.get('classId') || '';

  const [user, setUser] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>(initialClassId);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  
  const [showAdd, setShowAdd] = useState(initialClassId !== '');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [expandedAssignId, setExpandedAssignId] = useState<number | null>(null);
  const [assignmentToDelete, setAssignmentToDelete] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    type: 'Writing'
  });
  
  const [attachments, setAttachments] = useState<{name: string, url: string}[]>([]);
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
       alert("File is too large. Max 2MB allowed.");
       return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
       const dataUrl = event.target?.result as string;
       setAttachments(prev => [...prev, { name: file.name, url: dataUrl }]);
    };
    reader.readAsDataURL(file);
  };
  
  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };
  
  // Array of student user_ids to assign to. Empty means no one. We can add a "Select All" button.
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  
  useEffect(() => {
    const uStr = localStorage.getItem('user');
    if (uStr) {
      const u = JSON.parse(uStr);
      setUser(u);
      fetchClasses();
    }
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const cId = searchParams.get('classId');
    if (cId) {
      setSelectedClassId(cId);
      setShowAdd(true);
    }
  }, [location.search]);

  useEffect(() => {
    if (selectedClassId && user) {
      fetchAssignments(selectedClassId);
      fetchStudents(selectedClassId);
    } else {
      setAssignments([]);
      setStudents([]);
    }
  }, [selectedClassId, user]);

  const fetchClasses = async () => {
    const uStr = localStorage.getItem('user');
    let teacherId = '';
    if (uStr) {
       const u = JSON.parse(uStr);
       teacherId = u.id;
    }
    const { data } = await supabase.from('classes').select('class_id, class_name').order('class_name');
    if (data) {
       setClasses(data);
       if (teacherId) {
          const { data: submittedData } = await supabase
            .from('assignments')
            .select('class_id, assignment_students!inner(status)')
            .eq('teacher_id', teacherId)
            .eq('assignment_students.status', 'submitted');
            
          if (submittedData && submittedData.length > 0) {
              const searchParams = new URLSearchParams(location.search);
              if (!searchParams.get('classId')) {
                  setSelectedClassId(String(submittedData[0].class_id));
              }
          }
       }
    }
  };

  const fetchAssignments = async (classId: string) => {
    if (!user) return;
    const { data } = await supabase
      .from('assignments')
      .select('*, assignment_students(*)')
      .eq('class_id', classId)
      .eq('teacher_id', user.id)
      .order('due_date', { ascending: false });
    if (data) setAssignments(data);
  };

  const fetchStudents = async (classId: string) => {
    // get students enrolled in this class
    const { data: enrollData, error } = await supabase
      .from('enrollments')
      .select('student_id')
      .eq('class_id', classId);
      
    if (enrollData && enrollData.length > 0) {
      const studentIds = enrollData.map((e: any) => e.student_id).filter(Boolean);
      if (studentIds.length > 0) {
        const { data: usersData } = await supabase
           .from('users')
           .select('user_id, first_name, last_name')
           .in('user_id', studentIds);
        if (usersData) {
           setStudents(usersData);
        }
      } else {
        setStudents([]);
      }
    } else {
      setStudents([]);
    }
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s.user_id));
    }
  };

  const toggleStudent = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || !user) return;
    if (selectedStudents.length === 0) {
      alert("Please select at least one student.");
      return;
    }
    
    setLoading(true);
    try {
      let finalDescription = formData.description;
      if (attachments.length > 0) {
        finalDescription += '\n\n---ATTACHMENTS---\n' + JSON.stringify(attachments);
      }
      
      let assignId = editingId;
      if (editingId) {
        const { error: updateError } = await supabase
          .from('assignments')
          .update({
            title: formData.title,
            description: finalDescription,
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
            description: finalDescription,
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
        if (studentError) throw studentError;
        
        setShowAdd(false);
        setFormData({ title: '', description: '', due_date: '', type: 'Writing' });
        setAttachments([]);
        setSelectedStudents([]);
        fetchAssignments(selectedClassId);
      }
    } catch (err) {
      console.error(err);
      alert("Error creating assignment.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    await supabase.from('assignments').delete().eq('assignment_id', id);
    fetchAssignments(selectedClassId);
    setAssignmentToDelete(null);
  };

  const handleUpdateStudentStatus = async (assignmentStudentId: number, currentStatus: string) => {
    const newStatus = (currentStatus === 'completed') ? 'pending' : 'completed';
    await supabase.from('assignment_students').update({ status: newStatus }).eq('assignment_student_id', assignmentStudentId);
    fetchAssignments(selectedClassId);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-8 pb-32 md:pb-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="font-display text-4xl text-primary font-bold tracking-tight">Assignments</h1>
          <p className="font-body text-lg text-on-surface-variant mt-2">Manage homework and assignments for your classes.</p>
        </div>
      </header>

      <div className="bg-surface-container rounded-3xl p-6 border border-outline-variant/30 flex items-center gap-4">
        <label className="font-label font-bold text-on-surface">Select Class:</label>
        <select 
          value={selectedClassId} 
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="flex-1 max-w-sm px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface"
        >
          <option value="">-- Choose a class --</option>
                    <optgroup label="My Classes (Lead & Co-Teacher)">
            {classes.filter(c => c.primary_teacher_id === user?.id || c.co_teacher_id === user?.id || (c.co_teachers || []).includes(user?.id)).map(c => (
              <option key={c.class_id} value={c.class_id}>{c.class_name}</option>
            ))}
          </optgroup>
          <optgroup label="Other Classes">
            {classes.filter(c => c.primary_teacher_id !== user?.id && c.co_teacher_id !== user?.id && !(c.co_teachers || []).includes(user?.id)).map(c => (
              <option key={c.class_id} value={c.class_id}>{c.class_name}</option>
            ))}
          </optgroup>
        </select>
        
        {selectedClassId && (
          <button 
            onClick={() => { setShowAdd(!showAdd); setEditingId(null); setFormData({title: '', description: '', due_date: '', type: 'Writing'}); setAttachments([]); setSelectedStudents([]); }} 
            className="ml-auto bg-primary text-on-primary px-6 py-2.5 rounded-full font-label font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors"
          >
            {showAdd ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {showAdd ? 'Cancel' : 'New Assignment'}
          </button>
        )}
      </div>

      {showAdd && selectedClassId && (
        <form onSubmit={handleSubmit} className="bg-surface-container-low rounded-3xl p-6 md:p-8 border border-outline-variant/40 shadow-sm flex flex-col gap-6">
          <h2 className="font-title text-xl font-bold text-on-surface">{editingId ? 'Edit Assignment' : 'Create New Assignment'}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-label text-sm font-bold text-on-surface-variant">Title</label>
              <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface" placeholder="e.g. Essay on Tang Dynasty" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-label text-sm font-bold text-on-surface-variant">Type</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface">
                <option value="Writing">Writing</option>
                <option value="Reading">Reading</option>
                <option value="Math">Math</option>
                <option value="Project">Project</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="font-label text-sm font-bold text-on-surface-variant">Description (Optional)</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface min-h-[100px]" placeholder="Detailed instructions..." />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="font-label text-sm font-bold text-on-surface-variant">Attachments</label>
              <div className="flex flex-col gap-3 p-4 bg-surface rounded-xl border border-outline-variant/30">
                 {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                       {attachments.map((att, i) => (
                          <div key={i} className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-full border border-outline-variant/30 text-sm font-body">
                             <FileText className="w-4 h-4 text-primary" />
                             <span className="truncate max-w-[150px]" title={att.name}>{att.name}</span>
                             <button type="button" onClick={() => removeAttachment(i)} className="text-on-surface-variant hover:text-error ml-1"><X className="w-4 h-4" /></button>
                          </div>
                       ))}
                    </div>
                 )}
                 <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-outline-variant/50 hover:border-primary/50 bg-surface-container-lowest hover:bg-surface-container-low transition-colors py-6 rounded-xl cursor-pointer">
                    <Plus className="w-5 h-5 text-primary" />
                    <span className="font-label font-bold text-primary">Add File Attachment</span>
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                 </label>
                 <p className="text-xs text-on-surface-variant font-body text-center">Max size 2MB</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-label text-sm font-bold text-on-surface-variant">Due Date</label>
              <input type="datetime-local" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface" />
            </div>
          </div>

          <div className="mt-4 pt-6 border-t border-outline-variant/30">
            <div className="flex items-center justify-between mb-4">
              <label className="font-label font-bold text-on-surface">Assign To Students</label>
              <button type="button" onClick={handleSelectAll} className="text-primary font-label text-sm font-bold hover:underline">
                {selectedStudents.length === students.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-2">
              {students.length === 0 ? (
                <p className="text-on-surface-variant text-sm font-body italic col-span-3">No students enrolled in this class.</p>
              ) : (
                students.map(s => (
                  <label key={s.user_id} onClick={() => toggleStudent(s.user_id)} className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors",
                    selectedStudents.includes(s.user_id) ? "bg-primary-container/30 border-primary/50" : "bg-surface border-outline-variant/30 hover:border-primary/30"
                  )}>
                    {selectedStudents.includes(s.user_id) ? (
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-outline-variant shrink-0" />
                    )}
                    <span className="font-label font-bold text-on-surface">{s.first_name} {s.last_name}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 flex gap-4">
             <button type="submit" disabled={loading} className="bg-primary text-on-primary px-8 py-3 rounded-full font-label font-bold shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
               {loading ? 'Saving...' : 'Save Assignment'}
             </button>
             <button type="button" onClick={() => { setShowAdd(false); setEditingId(null); setFormData({title: '', description: '', due_date: '', type: 'Writing'}); setAttachments([]); setSelectedStudents([]); }} className="border border-outline-variant px-8 py-3 rounded-full font-label font-bold text-on-surface-variant hover:bg-surface-variant transition-colors">
               Cancel
             </button>
          </div>
        </form>
      )}

      {selectedClassId && !showAdd && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 border-b border-outline-variant/30 pb-2 mb-4">
            <button onClick={() => setActiveTab('active')} className={`font-title text-xl font-bold px-4 py-2 ${activeTab === 'active' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>Active</button>
            <button onClick={() => setActiveTab('history')} className={`font-title text-xl font-bold px-4 py-2 ${activeTab === 'history' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>History</button>
          </div>
          
          {(() => {
            const filteredAssignments = assignments.filter(a => activeTab === 'active' ? (!a.due_date || new Date(a.due_date) >= new Date()) : (a.due_date && new Date(a.due_date) < new Date()));
            if (filteredAssignments.length === 0) {
              return (
                <div className="bg-surface-container-low p-12 rounded-3xl border border-outline-variant/30 text-center flex flex-col items-center">
                  <FileText className="w-12 h-12 text-on-surface-variant/30 mb-4" />
                  <p className="font-label font-bold text-on-surface-variant">{activeTab === 'active' ? 'No active assignments.' : 'No assignment history.'}</p>
                </div>
              );
            }
            return (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredAssignments.map(a => (

                <div key={a.assignment_id} className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/30 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded text-xs font-label font-bold">{a.type}</span>
                        {(() => {
                          const students = a.assignment_students || [];
                          const total = students.length;
                          const completed = students.filter((s: any) => s.status === 'completed' || s.status === 'submitted').length;
                          let status = 'Not Started';
                          let colorClass = 'bg-surface-variant text-on-surface-variant';
                          if (total > 0) {
                             if (completed === 0) {
                                status = 'Not Started';
                                colorClass = 'bg-error-container text-on-error-container';
                             } else if (completed === total) {
                                status = 'Completed';
                                colorClass = 'bg-primary-container text-on-primary-container';
                             } else {
                                status = 'In Progress';
                                colorClass = 'bg-tertiary-container text-on-tertiary-container';
                             }
                          }
                          return (
                             <span className={`px-2 py-0.5 rounded-full text-xs font-label font-bold ${colorClass}`}>
                                {status}
                             </span>
                          );
                        })()}
                        <h3 className="font-title font-bold text-on-surface">{a.title}</h3>
                      </div>
                      {(() => {
                          let displayDesc = a.description || '';
                          let atts = [];
                          if (displayDesc.includes('\n\n---ATTACHMENTS---\n')) {
                             const parts = displayDesc.split('\n\n---ATTACHMENTS---\n');
                             displayDesc = parts[0];
                             try { atts = JSON.parse(parts[1]); } catch(e){}
                          }
                          return (
                            <>
                              <p className="font-body text-sm text-on-surface-variant line-clamp-2">{displayDesc}</p>
                              {atts.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                   {atts.map((att: any, i: number) => (
                                      <a key={i} href={att.url} download={att.name} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5 bg-surface px-2 py-1 rounded border border-outline-variant/30 text-xs font-label hover:bg-surface-variant transition-colors text-primary">
                                        <FileText className="w-3.5 h-3.5" />
                                        <span className="truncate max-w-[120px]" title={att.name}>{att.name}</span>
                                      </a>
                                   ))}
                                </div>
                              )}
                            </>
                          );
                        })()}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => {
                        let editDesc = a.description || '';
                        let editAtts = [];
                        if (editDesc.includes('\n\n---ATTACHMENTS---\n')) {
                           const parts = editDesc.split('\n\n---ATTACHMENTS---\n');
                           editDesc = parts[0];
                           try { editAtts = JSON.parse(parts[1]); } catch(e){}
                        }
                        
                        let formattedDueDate = '';
                        if (a.due_date) {
                          try {
                            const d = new Date(a.due_date);
                            const yyyy = d.getFullYear();
                            const mm = String(d.getMonth() + 1).padStart(2, '0');
                            const dd = String(d.getDate()).padStart(2, '0');
                            const hh = String(d.getHours()).padStart(2, '0');
                            const min = String(d.getMinutes()).padStart(2, '0');
                            formattedDueDate = `${yyyy}-${mm}-${dd}T${hh}:${min}`;
                          } catch (e) {}
                        }

                        setEditingId(a.assignment_id);
                        setFormData({
                          title: a.title,
                          description: editDesc,
                          due_date: formattedDueDate,
                          type: a.type
                        });
                        setAttachments(editAtts);
                        setSelectedStudents((a.assignment_students || []).map((as: any) => as.student_id));
                        setShowAdd(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }} className="p-2 text-on-surface-variant hover:bg-surface-variant hover:text-primary rounded-xl transition-colors" title="Edit">
                        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                      </button>
                      <button onClick={() => setAssignmentToDelete(a.assignment_id)} className="p-2 text-on-surface-variant hover:bg-error-container hover:text-error rounded-xl transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-outline-variant/20">
                    <div className="flex items-center gap-1.5 text-on-surface-variant text-sm font-label">
                      <Calendar className="w-4 h-4" />
                      {a.due_date ? new Date(a.due_date).toLocaleString('en-US', { timeZone: 'America/New_York' , timeZoneName: 'short'}) : 'No due date'}
                    </div>
                    <button 
                      onClick={() => setExpandedAssignId(expandedAssignId === a.assignment_id ? null : a.assignment_id)}
                      className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-full font-label font-bold transition-colors cursor-pointer"
                    >
                      <Users className="w-4 h-4" />
                      View Submissions ({a.assignment_students?.length || 0})
                    </button>
                  </div>
                  
                  {expandedAssignId === a.assignment_id && (
                     <div className="mt-4 pt-4 border-t border-outline-variant/30 flex flex-col gap-2">
                        <h4 className="font-label font-bold text-on-surface text-sm mb-1">Student Status</h4>
                        {(a.assignment_students || []).map((as: any) => {
                           const student = students.find(s => s.user_id === as.student_id);
                           const isSubmitted = as.status === 'submitted' || as.status === 'completed';
                           return (
                              <div key={as.assignment_student_id} className="flex flex-col bg-surface-container py-2 px-3 rounded-lg border border-outline-variant/20 gap-2">
                                 <div className="flex items-center justify-between">
                                    <span className="font-body text-sm text-on-surface">{student ? `${student.first_name} ${student.last_name}` : 'Unknown Student'}</span>
                                    <div className="flex items-center gap-2">
                                       <span className={`font-label font-bold text-xs px-2 py-0.5 rounded-full ${as.status === 'completed' ? 'bg-primary-container text-on-primary-container' : as.status === 'submitted' ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-surface-variant text-on-surface-variant'}`}>
                                          {as.status === 'completed' ? 'Completed' : as.status === 'submitted' ? 'Submitted' : 'Pending'}
                                       </span>
                                       <button 
                                         onClick={() => handleUpdateStudentStatus(as.assignment_student_id, as.status)}
                                         className="p-1.5 hover:bg-surface-variant text-on-surface-variant rounded-full transition-colors"
                                         title={as.status === 'completed' ? 'Mark as Pending' : 'Mark as Completed'}
                                       >
                                         {as.status === 'completed' ? <XCircle className="w-4 h-4 text-error" /> : <CheckCircle2 className="w-4 h-4 text-primary" />}
                                       </button>
                                    </div>
                                 </div>
                                 {(() => {
                                     let subAtts = [];
                                     let rawText = '';
                                     if (as.feedback) {
                                         if (as.feedback.includes('\n\n---SUBMISSION_ATTACHMENTS---\n')) {
                                             try {
                                                 const parts = as.feedback.split('\n\n---SUBMISSION_ATTACHMENTS---\n');
                                                 rawText = parts[0];
                                                 subAtts = JSON.parse(parts[1]);
                                             } catch (e) {}
                                         } else {
                                             rawText = as.feedback;
                                         }
                                     }
                                     
                                     const cleanRawText = rawText ? rawText.replace(/<[^>]*>?/gm, '').trim() : '';
                                     
                                     if (subAtts.length > 0 || cleanRawText || isSubmitted) {
                                         return (
                                             <div className="flex flex-col gap-2 pt-3 mt-1 border-t border-outline-variant/20">
                                                 <span className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider">Student Submission</span>
                                                 {cleanRawText && (
                                                     <div className="tiptap-editor prose prose-sm sm:prose-base max-w-none font-body text-sm text-on-surface bg-surface p-2 rounded border border-outline-variant/30 px-3 py-2 min-h-[50px] break-normal" dangerouslySetInnerHTML={{ __html: rawText }} />
                                                 )}
                                                 {!cleanRawText && subAtts.length === 0 && (
                                                     <div className="font-body text-sm text-on-surface-variant italic bg-surface p-2 rounded border border-outline-variant/30 px-3 py-2">
                                                         Blank submission (no text or attachments provided).
                                                     </div>
                                                 )}
                                                 {subAtts.length > 0 && (
                                                     <div className="flex flex-wrap gap-2">
                                                         {subAtts.map((att: any, i: number) => (
                                                             <a key={i} href={att.url} download={att.name} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-primary-container/30 px-3 py-1.5 rounded-lg border border-primary/20 text-xs font-label hover:bg-primary-container/50 transition-colors text-primary shadow-sm">
                                                                 <FileText className="w-4 h-4" />
                                                                 <span className="truncate max-w-[200px]" title={att.name}>{att.name}</span>
                                                             </a>
                                                         ))}
                                                     </div>
                                                 )}
                                             </div>
                                         );
                                     }
                                     return null;
                                 })()}
                              </div>
                           );
                        })}
                        {(a.assignment_students || []).length === 0 && (
                           <p className="text-sm font-body text-on-surface-variant italic">No students assigned.</p>
                        )}
                     </div>
                  )}

                </div>
              ))}
            </div>
          );
          })()}
        </div>
      )}

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

