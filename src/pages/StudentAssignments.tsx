import React, { useState, useEffect } from "react";
import { BookOpen, Clock, CheckCircle2, ChevronRight, AlertCircle, FileText, Upload, X } from "lucide-react";
import { cn } from "../lib/utils";
import { supabase } from "../lib/supabase";

export default function StudentAssignments() {
  const [activeTab, setActiveTab] = useState("all");
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [attachmentsByTask, setAttachmentsByTask] = useState<Record<number, {name: string, url: string}[]>>({});

  const handleFileUpload = (assignmentStudentId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
       alert("File is too large. Max 2MB allowed.");
       return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
       const dataUrl = event.target?.result as string;
       setAttachmentsByTask(prev => ({
         ...prev,
         [assignmentStudentId]: [...(prev[assignmentStudentId] || []), { name: file.name, url: dataUrl }]
       }));
    };
    reader.readAsDataURL(file);
  };
  
  const removeAttachment = (assignmentStudentId: number, index: number) => {
    setAttachmentsByTask(prev => {
      const arr = prev[assignmentStudentId] || [];
      return {
         ...prev,
         [assignmentStudentId]: arr.filter((_, i) => i !== index)
      };
    });
  };

  useEffect(() => {
    const fetchAssignments = async () => {
      const uStr = localStorage.getItem('user');
      if (!uStr) return;
      const user = JSON.parse(uStr);
      
      const { data, error } = await supabase
        .from('assignment_students')
        .select(`
          assignment_student_id,
          status,
          feedback,
          assignments (
             title, type, due_date, description,
             classes ( class_name )
          )
        `)
        .eq('student_id', user.id);
        
      if (data) {
        setAssignments(data);
      }
      setLoading(false);
    };
    
    fetchAssignments();
  }, []);

  const getStatusDisplay = (status: string, dueDateStr: string) => {
     let displayStatus = status || 'pending';
     if (displayStatus === 'pending' && dueDateStr) {
        const due = new Date(dueDateStr);
        if (due < new Date()) {
           displayStatus = 'late';
        }
     }
     return displayStatus;
  };

  const filteredAssignments = assignments.filter(a => {
    const displayStatus = getStatusDisplay(a.status, a.assignments?.due_date);
    if (activeTab === "all") return true;
    if (activeTab === "pending") return displayStatus === "pending" || displayStatus === "late";
    if (activeTab === "completed") return displayStatus === "submitted" || displayStatus === "completed";
    return true;
  });



  const handleSubmitAssignment = async (assignmentStudentId: number) => {
    const atts = attachmentsByTask[assignmentStudentId] || [];
    let feedback = '';
    if (atts.length > 0) {
       feedback = '\n\n---SUBMISSION_ATTACHMENTS---\n' + JSON.stringify(atts);
    }
    
    await supabase.from('assignment_students').update({ status: 'submitted', feedback }).eq('assignment_student_id', assignmentStudentId);
    setAssignments(assignments.map(a => 
      a.assignment_student_id === assignmentStudentId ? { ...a, status: 'submitted', feedback } : a
    ));
    
    setAttachmentsByTask(prev => {
      const newObj = { ...prev };
      delete newObj[assignmentStudentId];
      return newObj;
    });
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto p-6 md:p-8 flex flex-col gap-8 pb-32 md:pb-8">
       {/* Header */}
       <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div>
           <h1 className="font-display text-4xl text-primary font-bold tracking-tight">Assignments</h1>
           <p className="font-body text-lg text-on-surface-variant mt-2">Manage your homework and projects.</p>
         </div>
       </header>

       {/* Tabs */}
       <div className="flex gap-4 border-b border-outline-variant/30">
          <button 
            onClick={() => setActiveTab("all")}
            className={cn("pb-4 font-label font-bold text-sm transition-all border-b-2", activeTab === "all" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface")}
          >
            All Assignments
          </button>
          <button 
            onClick={() => setActiveTab("pending")}
            className={cn("pb-4 font-label font-bold text-sm transition-all border-b-2", activeTab === "pending" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface")}
          >
            To Do
          </button>
          <button 
            onClick={() => setActiveTab("completed")}
            className={cn("pb-4 font-label font-bold text-sm transition-all border-b-2", activeTab === "completed" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface")}
          >
            Completed
          </button>
       </div>

       {/* List xs:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
             <div className="col-span-full py-12 text-center text-on-surface-variant font-body">Loading assignments...</div>
          ) : filteredAssignments.length === 0 ? (
             <div className="col-span-full py-12 text-center flex flex-col items-center justify-center bg-surface-container-low rounded-3xl border border-outline-variant/30">
                <CheckCircle2 className="w-12 h-12 text-primary opacity-50 mb-4" />
                <p className="font-label font-bold text-on-surface-variant text-lg">All caught up!</p>
             </div>
          ) : filteredAssignments.map(a => {
             const assignData = a.assignments;
             const displayStatus = getStatusDisplay(a.status, assignData?.due_date);
             const isLate = displayStatus === 'late';
             const isSubmitted = displayStatus === 'submitted' || displayStatus === 'completed';
             
             return (
               <div key={a.assignment_student_id} className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 flex flex-col hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                     <span className={cn(
                       "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-label flex items-center gap-1.5",
                       isSubmitted ? "bg-primary-container/20 text-primary border border-primary/20" :
                       isLate ? "bg-error-container/20 text-error border border-error/20" :
                       "bg-tertiary-container/20 text-tertiary border border-tertiary/20"
                     )}>
                        {isSubmitted ? <CheckCircle2 className="w-3.5 h-3.5" /> : 
                         isLate ? <AlertCircle className="w-3.5 h-3.5" /> :
                         <Clock className="w-3.5 h-3.5" />}
                        {displayStatus}
                     </span>
                     <span className="font-caption text-xs text-on-surface-variant border border-outline-variant/50 px-2.5 py-1 rounded-md">
                       {assignData?.type || 'Other'}
                     </span>
                  </div>
                  
                  <h3 className="font-title text-xl font-bold text-on-surface mb-2">{assignData?.title}</h3>
                  <p className="font-label text-sm text-on-surface-variant mb-4 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> {assignData?.classes?.class_name || 'General'}
                  </p>
                  
                  {(() => {
                     let displayDesc = assignData?.description || '';
                     let atts = [];
                     if (displayDesc.includes('\n\n---ATTACHMENTS---\n')) {
                        const parts = displayDesc.split('\n\n---ATTACHMENTS---\n');
                        displayDesc = parts[0];
                        try { atts = JSON.parse(parts[1]); } catch(e){}
                     }
                     return (
                        <>
                           {displayDesc && (
                              <p className="font-body text-sm text-on-surface-variant mb-6 line-clamp-3">{displayDesc}</p>
                           )}
                           {atts.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-6">
                                 {atts.map((att: any, i: number) => (
                                    <a key={i} href={att.url} download={att.name} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5 bg-surface px-2 py-1 rounded border border-outline-variant/30 text-xs font-label hover:bg-surface-variant transition-colors text-primary">
                                      <FileText className="w-3.5 h-3.5" />
                                      <span className="truncate max-w-[150px]" title={att.name}>{att.name}</span>
                                    </a>
                                 ))}
                              </div>
                           )}
                        </>
                     );
                  })()}

                  <div className="mt-auto flex flex-col pt-4 border-t border-outline-variant/20 gap-4">
                     {isSubmitted && (() => {
                         let subAtts = [];
                         if (a.feedback && a.feedback.includes('\n\n---SUBMISSION_ATTACHMENTS---\n')) {
                             try {
                                 subAtts = JSON.parse(a.feedback.split('\n\n---SUBMISSION_ATTACHMENTS---\n')[1]);
                             } catch(e) {}
                         }
                         if (subAtts.length > 0) {
                             return (
                                 <div className="flex flex-col gap-2">
                                     <span className="font-label text-xs font-bold text-on-surface-variant">Your Submission:</span>
                                     <div className="flex flex-wrap gap-2">
                                         {subAtts.map((att: any, i: number) => (
                                             <a key={i} href={att.url} download={att.name} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-primary-container/30 px-2 py-1 rounded border border-primary/20 text-xs font-label hover:bg-primary-container/50 transition-colors text-primary">
                                                 <FileText className="w-3.5 h-3.5" />
                                                 <span className="truncate max-w-[150px]" title={att.name}>{att.name}</span>
                                             </a>
                                         ))}
                                     </div>
                                 </div>
                             );
                         }
                         return null;
                     })()}
                     
                     {!isSubmitted && (
                         <div className="flex flex-col gap-3">
                             <div className="flex flex-col gap-2">
                                 <label className="font-label text-xs font-bold text-on-surface-variant">Attach Work (Optional)</label>
                                 {(attachmentsByTask[a.assignment_student_id] || []).length > 0 && (
                                     <div className="flex flex-wrap gap-2">
                                         {(attachmentsByTask[a.assignment_student_id] || []).map((att, i) => (
                                             <div key={i} className="flex items-center gap-1.5 bg-surface-container-low px-2 py-1 rounded border border-outline-variant/30 text-xs font-body">
                                                 <FileText className="w-3.5 h-3.5 text-primary" />
                                                 <span className="truncate max-w-[120px]" title={att.name}>{att.name}</span>
                                                 <button type="button" onClick={() => removeAttachment(a.assignment_student_id, i)} className="text-on-surface-variant hover:text-error ml-1">
                                                     <X className="w-3.5 h-3.5" />
                                                 </button>
                                             </div>
                                         ))}
                                     </div>
                                 )}
                                 <label className="flex items-center justify-center gap-2 w-full border border-dashed border-outline-variant/50 hover:border-primary/50 bg-surface-container-lowest hover:bg-surface-container-low transition-colors py-3 rounded-lg cursor-pointer">
                                     <Upload className="w-4 h-4 text-primary" />
                                     <span className="font-label text-xs font-bold text-primary">Upload File</span>
                                     <input type="file" className="hidden" onChange={(e) => handleFileUpload(a.assignment_student_id, e)} />
                                 </label>
                             </div>
                         </div>
                     )}

                     <div className="flex items-center justify-between mt-2">
                         <div className="flex flex-col">
                           <span className="font-caption text-[10px] uppercase text-on-surface-variant font-bold tracking-wider">Due Date</span>
                           <span className={cn("font-label text-sm font-bold", isLate ? "text-error" : "text-on-surface")}>
                              {assignData?.due_date ? new Date(assignData.due_date).toLocaleString() : 'No Due Date'}
                           </span>
                         </div>
                         {!isSubmitted && (
                            <button onClick={() => handleSubmitAssignment(a.assignment_student_id)} className="bg-primary text-on-primary hover:bg-primary/90 px-6 py-2 rounded-xl text-sm font-label font-bold transition-colors">
                               Submit Assignment
                            </button>
                         )}
                     </div>
                  </div>
               </div>
             );
          })}
       </div>
    </div>
  );
}
