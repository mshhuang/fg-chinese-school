import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { BookOpen, Plus, Trash2, Library, MapPin, Pencil, Clock } from "lucide-react";
import AdminEnrollments from "./AdminEnrollments";

export default function AdminAcademic() {
  const [activeTab, setActiveTab] = useState<'programs' | 'classes' | 'rooms' | 'subjects' | 'periods' | 'enrollments'>('programs');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);

  const [progName, setProgName] = useState("");
  const [progSchoolYear, setProgSchoolYear] = useState("");
  const [progStartDate, setProgStartDate] = useState("");
  const [progEndDate, setProgEndDate] = useState("");
  const [progStatus, setProgStatus] = useState("Active");

  const [classNameInput, setClassNameInput] = useState("");
  const [roomNumberInput, setRoomNumberInput] = useState("");
  const [subjectNameInput, setSubjectNameInput] = useState("");
  const [periodNameInput, setPeriodNameInput] = useState("");
  const [periodTimeInput, setPeriodTimeInput] = useState("");

  const [programsList, setProgramsList] = useState<any[]>([]);

  const [errorMsg, setErrorMsg] = useState("");
  const [toastMessage, setToastMessage] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  useEffect(() => {
    if (['programs', 'classes', 'rooms', 'subjects', 'periods'].includes(activeTab)) {
      fetchData();
    }
    if (activeTab === 'classes') {
       fetchPrograms();
    }
    setShowAdd(false);
    setEditingId(null);
    setProgName("");
    setProgSchoolYear("");
    setProgStartDate("");
    setProgEndDate("");
    setProgStatus("Active");
    setClassNameInput("");
    setRoomNumberInput("");
    setSubjectNameInput("");
    setPeriodNameInput("");
    setPeriodTimeInput("");
    setErrorMsg("");
  }, [activeTab]);

  async function fetchPrograms() {
    const { data } = await supabase.from('programs').select('*').order('program_name', { ascending: true });
    if (data) setProgramsList(data);
  }

  async function fetchData() {
    setLoading(true);
    let table = activeTab;
    const { data: res, error } = await supabase.from(table).select('*').order(table === 'programs' ? 'program_id' : table === 'classes' ? 'class_id' : table === 'subjects' ? 'subject_id' : table === 'periods' ? 'period_id' : 'room_id', { ascending: false });
    if (res) setData(res);
    setLoading(false);
  }

  async function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    let resError = null;

    if (activeTab === 'programs') {
       if (editingId) {
         // @ts-ignore
         const { error } = await supabase.from('programs').update({ program_name: progName, school_year_or_term: progSchoolYear || null, start_date: progStartDate || null, end_date: progEndDate || null, status: progStatus || null }).eq('program_id', editingId);
         resError = error;
       } else {
         // @ts-ignore
         const { error } = await supabase.from('programs').insert([{ program_name: progName, school_year_or_term: progSchoolYear || null, start_date: progStartDate || null, end_date: progEndDate || null, status: progStatus || null }]);
         resError = error;
       }
    } else if (activeTab === 'classes') {
       if (editingId) {
         // @ts-ignore
         const { error } = await supabase.from('classes').update({ class_name: classNameInput }).eq('class_id', editingId);
         resError = error;
       } else {
         // @ts-ignore
         const { error } = await supabase.from('classes').insert([{ class_name: classNameInput }]);
         resError = error;
       }
    } else if (activeTab === 'rooms') {
       if (editingId) {
         // @ts-ignore
         const { error } = await supabase.from('rooms').update({ room_number: roomNumberInput }).eq('room_id', editingId);
         resError = error;
       } else {
         // @ts-ignore
         const { error } = await supabase.from('rooms').insert([{ room_number: roomNumberInput }]);
         resError = error;
       }
    } else if (activeTab === 'subjects') {
       if (editingId) {
         // @ts-ignore
         const { error } = await supabase.from('subjects').update({ subject_name: subjectNameInput }).eq('subject_id', editingId);
         resError = error;
       } else {
         // @ts-ignore
         const { error } = await supabase.from('subjects').insert([{ subject_name: subjectNameInput }]);
         resError = error;
       }
    } else if (activeTab === 'periods') {
       if (editingId) {
         // @ts-ignore
         const { error } = await supabase.from('periods').update({ period_name: periodNameInput, time: periodTimeInput }).eq('period_id', editingId);
         resError = error;
       } else {
         // @ts-ignore
         const { error } = await supabase.from('periods').insert([{ period_name: periodNameInput, time: periodTimeInput }]);
         resError = error;
       }
    }

    if (!resError) {
      setProgName("");
      setProgSchoolYear("");
      setProgStartDate("");
      setProgEndDate("");
      setProgStatus("Active");
      setClassNameInput("");
      setRoomNumberInput("");
      setSubjectNameInput("");
      setPeriodNameInput("");
      setPeriodTimeInput("");
      setShowAdd(false);
      setEditingId(null);
      showToast("Successfully saved.", "success");
      fetchData();
    } else {
      if (resError.code === '23505' || resError.message?.toLowerCase().includes('duplicate')) {
         showToast("Warning: The data you entered already exists. Please check for duplicates.", "error");
      } else {
         showToast(resError.message, "error");
      }
    }
  }

  function getRowId(row: any) {
    return activeTab === 'programs' ? row.program_id : activeTab === 'classes' ? row.class_id : activeTab === 'subjects' ? row.subject_id : activeTab === 'periods' ? row.period_id : row.room_id;
  }

  function handleEdit(row: any) {
    setErrorMsg("");
    setEditingId(getRowId(row));
    if (activeTab === 'programs') {
      setProgName(row.program_name || "");
      setProgSchoolYear(row.school_year_or_term || "");
      setProgStartDate(row.start_date || "");
      setProgEndDate(row.end_date || "");
      setProgStatus(row.status || "Active");
    } else if (activeTab === 'classes') {
      setClassNameInput(row.class_name);
    } else if (activeTab === 'rooms') {
      setRoomNumberInput(row.room_number);
    } else if (activeTab === 'subjects') {
      setSubjectNameInput(row.subject_name);
    } else if (activeTab === 'periods') {
      setPeriodNameInput(row.period_name);
      setPeriodTimeInput(row.time);
    }
    setShowAdd(true);
  }

  async function handleDelete(id: any) {
    if (!confirm("Are you sure?")) return;
    const idField = activeTab === 'programs' ? 'program_id' : activeTab === 'classes' ? 'class_id' : activeTab === 'subjects' ? 'subject_id' : activeTab === 'periods' ? 'period_id' : 'room_id';
    const { error } = await supabase.from(activeTab).delete().eq(idField, id);
    if (error) {
      showToast(error.message, "error");
    } else {
      showToast("Successfully deleted.", "success");
      fetchData();
    }
  }

  const isBaseData = ['programs', 'classes', 'rooms', 'subjects', 'periods'].includes(activeTab);

  return (
    <div className="p-6 md:p-8 flex flex-col gap-8 w-full max-w-7xl mx-auto pb-32 md:pb-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h1 className="font-display text-4xl text-primary font-bold tracking-tight">Academic Setup</h1>
           <p className="font-body text-lg text-on-surface-variant mt-2">Manage programs, classes, and facilities.</p>
        </div>
        {isBaseData && (
          <button 
            onClick={() => {
              if (!showAdd || editingId) {
                setProgName("");
                setProgSchoolYear("");
                setProgStartDate("");
                setProgEndDate("");
                setProgStatus("Active");
                setClassNameInput("");
                setRoomNumberInput("");
                setSubjectNameInput("");
                setPeriodNameInput("");
                setPeriodTimeInput("");
                setEditingId(null);
                setShowAdd(true);
              } else {
                setShowAdd(false);
              }
            }}
            className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-label font-bold hover:bg-primary/90 transition-colors shadow-sm w-full md:w-auto justify-center"
          >
             <Plus className="w-5 h-5" /> Add {activeTab === 'programs' ? 'Program' : activeTab === 'classes' ? 'Class' : activeTab === 'subjects' ? 'Subject' : activeTab === 'periods' ? 'Period' : 'Room'}
          </button>
        )}
      </header>

      <div className="flex gap-4 border-b border-outline-variant/30 overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setActiveTab('programs')}
            className={`pb-4 px-2 font-label font-bold text-sm whitespace-nowrap transition-all border-b-2 ${activeTab === 'programs' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'}`}
          >
            Programs
          </button>
          <button 
            onClick={() => setActiveTab('classes')}
            className={`pb-4 px-2 font-label font-bold text-sm whitespace-nowrap transition-all border-b-2 ${activeTab === 'classes' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'}`}
          >
            Classes
          </button>
          <button 
            onClick={() => setActiveTab('enrollments')}
            className={`pb-4 px-2 font-label font-bold text-sm whitespace-nowrap transition-all border-b-2 ${activeTab === 'enrollments' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'}`}
          >
            Enrollments
          </button>
          <div className="w-px h-6 bg-outline-variant/50 self-center mx-2" />
          <button 
            onClick={() => setActiveTab('subjects')}
            className={`pb-4 px-2 font-label font-bold text-sm whitespace-nowrap transition-all border-b-2 ${activeTab === 'subjects' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'}`}
          >
            Subjects
          </button>
          <button 
            onClick={() => setActiveTab('periods')}
            className={`pb-4 px-2 font-label font-bold text-sm whitespace-nowrap transition-all border-b-2 ${activeTab === 'periods' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'}`}
          >
            Periods
          </button>
          <button 
            onClick={() => setActiveTab('rooms')}
            className={`pb-4 px-2 font-label font-bold text-sm whitespace-nowrap transition-all border-b-2 ${activeTab === 'rooms' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'}`}
          >
            Rooms & Facilities
          </button>
      </div>

      {activeTab === 'enrollments' && <AdminEnrollments />}

      {isBaseData && errorMsg && (
        <div className="bg-orange-100 text-orange-800 border border-orange-200 px-4 py-3 rounded-lg font-body text-sm font-medium">
          {errorMsg}
        </div>
      )}

      {showAdd && isBaseData && activeTab === 'programs' && (
        <div className="bg-surface-container-low p-6 md:p-8 rounded-3xl border border-outline-variant/40 shadow-sm relative overflow-hidden">
           <h3 className="font-title text-xl font-bold text-on-surface mb-6">{editingId ? 'Edit Program' : 'Create New Program'}</h3>
           <form onSubmit={handleAddSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col gap-2 flex-1">
                  <label className="font-label text-sm font-bold text-on-surface-variant">Program Name</label>
                  <input required type="text" value={progName} onChange={(e) => setProgName(e.target.value)} className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface w-full" placeholder="e.g. Summer Camp" />
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <label className="font-label text-sm font-bold text-on-surface-variant">School Year / Term</label>
                  <input type="text" value={progSchoolYear} onChange={(e) => setProgSchoolYear(e.target.value)} className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface w-full" placeholder="e.g. 2026 Fall" />
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col gap-2 flex-1">
                  <label className="font-label text-sm font-bold text-on-surface-variant">Start Date</label>
                  <input type="date" value={progStartDate} onChange={(e) => setProgStartDate(e.target.value)} className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface w-full" />
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <label className="font-label text-sm font-bold text-on-surface-variant">End Date</label>
                  <input type="date" value={progEndDate} onChange={(e) => setProgEndDate(e.target.value)} className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface w-full" />
                </div>
              </div>
              <div className="flex flex-col gap-2 max-w-sm">
                <label className="font-label text-sm font-bold text-on-surface-variant">Status</label>
                <select value={progStatus} onChange={(e) => setProgStatus(e.target.value)} className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface">
                  <option value="Active">Active</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Ended">Ended</option>
                </select>
              </div>
              <div className="pt-4 flex gap-4">
                 <button type="submit" className="bg-primary text-on-primary px-8 py-3 rounded-full font-label font-bold shadow-sm hover:bg-primary/90 transition-colors">{editingId ? 'Update Program' : 'Save Program'}</button>
                 <button type="button" onClick={() => setShowAdd(false)} className="border border-outline-variant px-8 py-3 rounded-full font-label font-bold text-on-surface-variant hover:bg-surface-variant transition-colors">Cancel</button>
              </div>
           </form>
        </div>
      )}

      {showAdd && isBaseData && activeTab === 'classes' && (
        <div className="bg-surface-container-low p-6 md:p-8 rounded-3xl border border-outline-variant/40 shadow-sm relative overflow-hidden">
           <h3 className="font-title text-xl font-bold text-on-surface mb-6">{editingId ? 'Edit Class' : 'Create New Class'}</h3>
           <form onSubmit={handleAddSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-label text-sm font-bold text-on-surface-variant">Class Name</label>
                <input required type="text" value={classNameInput} onChange={(e) => setClassNameInput(e.target.value)} className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface w-full max-w-md" placeholder="e.g. Math 101" />
              </div>
              <div className="pt-4 flex gap-4">
                 <button type="submit" className="bg-primary text-on-primary px-8 py-3 rounded-full font-label font-bold shadow-sm hover:bg-primary/90 transition-colors">{editingId ? 'Update Class' : 'Save Class'}</button>
                 <button type="button" onClick={() => setShowAdd(false)} className="border border-outline-variant px-8 py-3 rounded-full font-label font-bold text-on-surface-variant hover:bg-surface-variant transition-colors">Cancel</button>
              </div>
           </form>
        </div>
      )}

      {showAdd && isBaseData && activeTab === 'rooms' && (
        <div className="bg-surface-container-low p-6 md:p-8 rounded-3xl border border-outline-variant/40 shadow-sm relative overflow-hidden">
           <h3 className="font-title text-xl font-bold text-on-surface mb-6">{editingId ? 'Edit Room' : 'Create New Room'}</h3>
           <form onSubmit={handleAddSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-label text-sm font-bold text-on-surface-variant">Room Number / Name</label>
                <input required type="text" value={roomNumberInput} onChange={(e) => setRoomNumberInput(e.target.value)} className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface w-full max-w-md" placeholder="e.g. 101A or Gym" />
              </div>
              <div className="pt-4 flex gap-4">
                 <button type="submit" className="bg-primary text-on-primary px-8 py-3 rounded-full font-label font-bold shadow-sm hover:bg-primary/90 transition-colors">{editingId ? 'Update Room' : 'Save Room'}</button>
                 <button type="button" onClick={() => setShowAdd(false)} className="border border-outline-variant px-8 py-3 rounded-full font-label font-bold text-on-surface-variant hover:bg-surface-variant transition-colors">Cancel</button>
              </div>
           </form>
        </div>
      )}

      {showAdd && isBaseData && activeTab === 'subjects' && (
        <div className="bg-surface-container-low p-6 md:p-8 rounded-3xl border border-outline-variant/40 shadow-sm relative overflow-hidden">
           <h3 className="font-title text-xl font-bold text-on-surface mb-6">{editingId ? 'Edit Subject' : 'Create New Subject'}</h3>
           <form onSubmit={handleAddSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-label text-sm font-bold text-on-surface-variant">Subject Name</label>
                <input required type="text" value={subjectNameInput} onChange={(e) => setSubjectNameInput(e.target.value)} className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface w-full max-w-md" placeholder="e.g. Mathematics" />
              </div>
              <div className="pt-4 flex gap-4">
                 <button type="submit" className="bg-primary text-on-primary px-8 py-3 rounded-full font-label font-bold shadow-sm hover:bg-primary/90 transition-colors">{editingId ? 'Update Subject' : 'Save Subject'}</button>
                 <button type="button" onClick={() => setShowAdd(false)} className="border border-outline-variant px-8 py-3 rounded-full font-label font-bold text-on-surface-variant hover:bg-surface-variant transition-colors">Cancel</button>
              </div>
           </form>
        </div>
      )}

      {showAdd && isBaseData && activeTab === 'periods' && (
        <div className="bg-surface-container-low p-6 md:p-8 rounded-3xl border border-outline-variant/40 shadow-sm relative overflow-hidden">
           <h3 className="font-title text-xl font-bold text-on-surface mb-6">{editingId ? 'Edit Period' : 'Create New Period'}</h3>
           <form onSubmit={handleAddSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-label text-sm font-bold text-on-surface-variant">Period Name</label>
                <input required type="text" value={periodNameInput} onChange={(e) => setPeriodNameInput(e.target.value)} className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface w-full max-w-md" placeholder="e.g. Period 1" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label text-sm font-bold text-on-surface-variant">Time Slot</label>
                <input required type="text" value={periodTimeInput} onChange={(e) => setPeriodTimeInput(e.target.value)} className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface w-full max-w-md" placeholder="e.g. 08:00 - 09:00 AM" />
              </div>
              <div className="pt-4 flex gap-4">
                 <button type="submit" className="bg-primary text-on-primary px-8 py-3 rounded-full font-label font-bold shadow-sm hover:bg-primary/90 transition-colors">{editingId ? 'Update Period' : 'Save Period'}</button>
                 <button type="button" onClick={() => setShowAdd(false)} className="border border-outline-variant px-8 py-3 rounded-full font-label font-bold text-on-surface-variant hover:bg-surface-variant transition-colors">Cancel</button>
              </div>
           </form>
        </div>
      )}

      {isBaseData && (
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl overflow-hidden shadow-sm">
           <div className="overflow-x-auto p-1">
             <table className="w-full text-left border-collapse min-w-[500px]">
               <thead>
                 <tr className="bg-surface-container-low border-b border-outline-variant/30 text-on-surface-variant">
                   <th className="p-4 font-label text-xs uppercase tracking-wider font-bold">ID</th>
                   <th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Name / Details</th>
                   <th className="p-4 font-label text-xs uppercase tracking-wider font-bold text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-outline-variant/20">
                 {loading ? (
                   <tr><td colSpan={3} className="p-8 text-center text-on-surface-variant font-body">Loading...</td></tr>
                 ) : data.length === 0 ? (
                   <tr><td colSpan={3} className="p-8 text-center text-on-surface-variant font-body">No records found.</td></tr>
                 ) : data.map((row: any) => (
                   <tr key={`row-${getRowId(row) ?? Math.random()}`} className="hover:bg-surface-variant/30 transition-colors">
                     <td className="p-4 font-body text-sm text-on-surface-variant">
                        #{getRowId(row)}
                     </td>
                     <td className="p-4">
                        <div className="flex items-center gap-3">
                           {activeTab === 'programs' && <BookOpen className="w-5 h-5 text-tertiary" />}
                           {activeTab === 'classes' && <Library className="w-5 h-5 text-secondary" />}
                           {activeTab === 'rooms' && <MapPin className="w-5 h-5 text-primary" />}
                           {activeTab === 'subjects' && <BookOpen className="w-5 h-5 text-tertiary" />}
                           {activeTab === 'periods' && <Clock className="w-5 h-5 text-primary" />}
                           <div className="flex flex-col">
                             <span className="font-label text-base font-bold text-on-surface">
                                {row.program_name || row.class_name || row.subject_name || row.period_name || `Room ${row.room_number}`}
                             </span>
                             {activeTab === 'programs' && (
                                <div className="flex items-center gap-2 mt-1">
                                  {row.status && (
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                      row.status === 'Active' ? 'bg-primary/10 text-primary' : row.status === 'Upcoming' ? 'bg-tertiary/10 text-tertiary' : 'bg-outline-variant/30 text-on-surface-variant'
                                    }`}>
                                      {row.status}
                                    </span>
                                  )}
                                  {row.school_year_or_term && (
                                    <span className="font-body text-sm text-on-surface-variant">
                                      {row.school_year_or_term}
                                    </span>
                                  )}
                                  {(row.start_date || row.end_date) && (
                                    <span className="font-body text-xs text-outline hidden md:inline">
                                      • {row.start_date || '?'} to {row.end_date || '?'}
                                    </span>
                                  )}
                                </div>
                             )}
                             {activeTab === 'periods' && row.time && (
                                <span className="font-body text-sm text-on-surface-variant">
                                  {row.time}
                                </span>
                             )}
                           </div>
                        </div>
                     </td>
                     <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <button onClick={() => handleEdit(row)} className="w-8 h-8 rounded-full inline-flex items-center justify-center text-on-surface-variant hover:bg-surface-variant hover:text-primary transition-colors">
                              <Pencil className="w-4 h-4" />
                           </button>
                           <button onClick={() => handleDelete(getRowId(row))} className="w-8 h-8 rounded-full inline-flex items-center justify-center text-on-surface-variant hover:bg-error-container hover:text-error transition-colors">
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      )}
      
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
