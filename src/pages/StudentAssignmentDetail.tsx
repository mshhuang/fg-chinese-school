import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BookOpen, Clock, CheckCircle2, ChevronRight, AlertCircle, FileText, Upload, X, ArrowLeft } from "lucide-react";
import { cn, formatTeacherName } from "../lib/utils";
import { supabase } from "../lib/supabase";
import { RichTextEditor } from "../components/RichTextEditor";

export default function StudentAssignmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [attachmentsByTask, setAttachmentsByTask] = useState<Record<number, {name: string, url: string}[]>>({});
  const [textByTask, setTextByTask] = useState<Record<number, string>>({});
  const [showBlankConfirm, setShowBlankConfirm] = useState<{show: boolean, id: number | null}>({show: false, id: null});

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
    const fetchAssignment = async () => {
      if (!id) return;
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
             classes ( class_name ),
             users ( first_name, last_name )
          )
        `)
        .eq('assignment_student_id', id)
        .eq('student_id', user.id)
        .single();
        
      if (data) {
        setAssignment(data);
        
        // Mark as read
        const stored = localStorage.getItem(`assign_read_${user.id}`);
        const readState = stored ? JSON.parse(stored) : {};
        if (!readState[data.assignment_student_id]) {
           readState[data.assignment_student_id] = true;
           localStorage.setItem(`assign_read_${user.id}`, JSON.stringify(readState));
           window.dispatchEvent(new Event('storage'));
        }
      }
      setLoading(false);
    };
    
    fetchAssignment();
  }, [id]);

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



  const handleSubmitAssignment = (assignmentStudentId: number) => {
    const atts = attachmentsByTask[assignmentStudentId] || [];
    let feedback = textByTask[assignmentStudentId] || '';

    const cleanText = feedback.replace(/<[^>]*>?/gm, '').trim();
    if (atts.length === 0 && !cleanText) {
        setShowBlankConfirm({show: true, id: assignmentStudentId});
        return;
    }

    executeSubmitAssignment(assignmentStudentId);
  };

  const executeSubmitAssignment = async (assignmentStudentId: number) => {
    const atts = attachmentsByTask[assignmentStudentId] || [];
    let feedback = textByTask[assignmentStudentId] || '';

    if (atts.length > 0) {
       feedback += '\n\n---SUBMISSION_ATTACHMENTS---\n' + JSON.stringify(atts);
    }
    
    const { error } = await supabase.from('assignment_students').update({ status: 'submitted', feedback }).eq('assignment_student_id', assignmentStudentId);
    if (error) {
       console.error("Error submitting assignment:", error);
       alert("Error submitting assignment: " + error.message);
       return;
    }

    setShowBlankConfirm({show: false, id: null});
    setAssignment({ ...assignment, status: 'submitted', feedback });
    
    setAttachmentsByTask(prev => {
      const newObj = { ...prev };
      delete newObj[assignmentStudentId];
      return newObj;
    });
    setTextByTask(prev => {
      const newObj = { ...prev };
      delete newObj[assignmentStudentId];
      return newObj;
    });
  };

  const handleUnsubmitAssignment = async (assignmentStudentId: number) => {
    // We can extract current feedback so they can edit it
    let subAtts = [];
    let feedbackText = '';
    if (assignment.feedback && assignment.feedback.includes('\n\n---SUBMISSION_ATTACHMENTS---\n')) {
        try {
            const parts = assignment.feedback.split('\n\n---SUBMISSION_ATTACHMENTS---\n');
            feedbackText = parts[0];
            subAtts = JSON.parse(parts[1]);
        } catch(e) {}
    } else {
        feedbackText = assignment.feedback || '';
    }

    const { error } = await supabase.from('assignment_students').update({ status: 'pending' }).eq('assignment_student_id', assignmentStudentId);
    if (error) {
       console.error("Error unsubmitting assignment:", error);
       alert("Error unsubmitting assignment: " + error.message);
       return;
    }

    setAssignment({ ...assignment, status: 'pending' });
    
    setTextByTask(prev => ({ ...prev, [assignmentStudentId]: feedbackText }));
    if (subAtts.length > 0) {
        setAttachmentsByTask(prev => ({ ...prev, [assignmentStudentId]: subAtts }));
    }
  };

  if (loading) {
     return <div className="p-8 text-center text-on-surface-variant font-body">Loading...</div>;
  }
  
  if (!assignment) {
     return <div className="p-8 text-center text-on-surface-variant font-body">Assignment not found.</div>;
  }
  
  const a = assignment;
  const assignData = a.assignments;
  const displayStatus = getStatusDisplay(a.status, assignData?.due_date);
  const isLate = displayStatus === 'late';
  const isSubmitted = displayStatus === 'submitted' || displayStatus === 'completed';

  return (
    <div className="w-full max-w-[800px] mx-auto p-6 md:p-8 flex flex-col gap-8 pb-32 md:pb-8">
       <button onClick={() => navigate('/student/assignments')} className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors self-start font-label font-bold text-sm">
         <ArrowLeft className="w-4 h-4" /> Back to Assignments
       </button>
       
       <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 md:p-8 flex flex-col hover:shadow-sm transition-shadow">
          <div className="flex justify-between items-start mb-6">
             <span className={cn(
               "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-label flex items-center gap-1.5",
               displayStatus === 'completed' ? "bg-primary-container/20 text-primary border border-primary/20" :
               displayStatus === 'submitted' ? "bg-tertiary-container/20 text-tertiary border border-tertiary/20" :
               isLate ? "bg-error-container/20 text-error border border-error/20" :
               "bg-surface-variant/50 text-on-surface-variant border border-outline-variant/50"
             )}>
                {displayStatus === 'completed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : 
                 displayStatus === 'submitted' ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                 isLate ? <AlertCircle className="w-3.5 h-3.5" /> :
                 <Clock className="w-3.5 h-3.5" />}
                {displayStatus}
             </span>
             <span className="font-caption text-sm text-on-surface-variant border border-outline-variant/50 px-3 py-1 rounded-md bg-surface">
               {assignData?.type || 'Other'}
             </span>
          </div>
          
          <h1 className="font-display text-3xl font-bold text-on-surface mb-3">{assignData?.title}</h1>
          <p className="font-label text-base text-on-surface-variant mb-6 flex items-center gap-3 border-b border-outline-variant/30 pb-6">
            <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> {assignData?.classes?.class_name || 'General'}</span>
            {assignData?.users && (
               <>
                 <span className="text-outline-variant">•</span>
                 <span>
                   Assigned by {formatTeacherName(assignData.users.first_name, assignData.users.last_name)}
                 </span>
               </>
            )}
            <span className="text-outline-variant">•</span>
            <span className={cn("flex items-center gap-1.5 font-bold", isLate ? "text-error" : "text-on-surface")}>
               <Clock className="w-4 h-4" /> Due: {assignData?.due_date ? new Date(assignData.due_date).toLocaleString('en-US', { timeZone: 'America/New_York' , timeZoneName: 'short'}) : 'No Due Date'}
            </span>
          </p>
          
          <div className="font-body text-base text-on-surface-variant leading-relaxed mb-8 whitespace-pre-wrap">
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
                      {displayDesc && <p className="mb-6">{displayDesc}</p>}
                      {atts.length > 0 && (
                         <div className="flex flex-col gap-3 mt-6 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/30">
                            <h4 className="font-label text-sm font-bold text-on-surface">Teacher Attachments:</h4>
                            <div className="flex flex-wrap gap-2">
                               {atts.map((att: any, i: number) => (
                                  <a key={i} href={att.url} download={att.name} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-surface px-3 py-2 rounded-xl border border-outline-variant/30 text-sm font-label hover:bg-surface-variant transition-colors text-primary shadow-sm">
                                    <FileText className="w-4 h-4" />
                                    <span className="truncate max-w-[200px]" title={att.name}>{att.name}</span>
                                  </a>
                               ))}
                            </div>
                         </div>
                      )}
                   </>
                );
             })()}
          </div>

          <div className="mt-8 flex flex-col pt-8 border-t-2 border-outline-variant/30 gap-6">
             <h2 className="font-title text-2xl font-bold text-on-surface">Your Work</h2>
             
             {isSubmitted && (() => {
                 let subAtts = [];
                 let feedbackText = '';
                 if (a.feedback && a.feedback.includes('\n\n---SUBMISSION_ATTACHMENTS---\n')) {
                     try {
                         const parts = a.feedback.split('\n\n---SUBMISSION_ATTACHMENTS---\n');
                         feedbackText = parts[0];
                         subAtts = JSON.parse(parts[1]);
                     } catch(e) {}
                 } else {
                     feedbackText = a.feedback || '';
                 }
                 
                 const cleanFeedbackText = feedbackText ? feedbackText.replace(/<[^>]*>?/gm, '').trim() : '';

                 return (
                     <div className="flex flex-col gap-6 bg-primary-container/10 p-6 rounded-3xl border border-primary/20">
                         {cleanFeedbackText && (
                             <div className="flex flex-col gap-2">
                                 <span className="font-label text-sm font-bold text-on-surface-variant">Your Report / Answers:</span>
                                 <div className="tiptap-editor prose prose-sm max-w-none font-body text-base text-on-surface px-0 py-0 break-normal" dangerouslySetInnerHTML={{ __html: feedbackText }} />
                             </div>
                         )}
                         {subAtts.length > 0 && (
                             <div className="flex flex-col gap-2">
                                 <span className="font-label text-sm font-bold text-on-surface-variant">Attached Work:</span>
                                 <div className="flex flex-wrap gap-2">
                                     {subAtts.map((att: any, i: number) => (
                                         <a key={i} href={att.url} download={att.name} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-primary-container/30 px-4 py-2 rounded-xl border border-primary/20 text-sm font-label hover:bg-primary-container/50 transition-colors text-primary shadow-sm">
                                             <FileText className="w-4 h-4" />
                                             <span className="truncate max-w-[200px]" title={att.name}>{att.name}</span>
                                         </a>
                                     ))}
                                 </div>
                             </div>
                         )}
                         {!cleanFeedbackText && subAtts.length === 0 && (
                             <p className="font-body text-on-surface-variant italic">You submitted this assignment without any text or attachments.</p>
                         )}
                         {a.status === 'submitted' && (
                             <div className="flex items-center justify-end pt-4 mt-2 border-t border-primary/20">
                                <button onClick={() => handleUnsubmitAssignment(a.assignment_student_id)} className="bg-surface text-primary hover:bg-surface-variant px-6 py-2.5 rounded-xl text-sm font-label font-bold transition-all border border-primary/20 shadow-sm hover:shadow">
                                   Unsubmit Assignment
                                </button>
                             </div>
                         )}
                     </div>
                 );
             })()}
             
             {!isSubmitted && (
                 <div className="flex flex-col gap-6 bg-surface-container-low p-6 md:p-8 rounded-3xl border border-outline-variant/30">
                     <div className="flex flex-col gap-3">
                         <label className="font-label text-sm font-bold text-on-surface">Your Report / Answers</label>
                         <RichTextEditor
                             value={textByTask[a.assignment_student_id] || ''}
                             onChange={(content) => setTextByTask(prev => ({ ...prev, [a.assignment_student_id]: content }))}
                             placeholder="Type your response here..."
                             className="bg-surface rounded-2xl border border-outline-variant/50 transition-all font-body text-base min-h-[150px]"
                         />
                     </div>
                     <div className="flex flex-col gap-3">
                         <label className="font-label text-sm font-bold text-on-surface">Attach Work (Optional)</label>
                         {(attachmentsByTask[a.assignment_student_id] || []).length > 0 && (
                             <div className="flex flex-wrap gap-2 p-3 bg-surface rounded-2xl border border-outline-variant/30">
                                 {(attachmentsByTask[a.assignment_student_id] || []).map((att, i) => (
                                     <div key={i} className="flex items-center gap-2 bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/30 text-sm font-body shadow-sm">
                                         <FileText className="w-4 h-4 text-primary" />
                                         <span className="truncate max-w-[200px]" title={att.name}>{att.name}</span>
                                         <button type="button" onClick={() => removeAttachment(a.assignment_student_id, i)} className="text-on-surface-variant hover:text-error ml-2 bg-surface p-1 rounded-full transition-colors">
                                             <X className="w-3.5 h-3.5" />
                                         </button>
                                     </div>
                                 ))}
                             </div>
                         )}
                         <label className="flex flex-col items-center justify-center gap-3 w-full border-2 border-dashed border-outline-variant/50 hover:border-primary/50 bg-surface-container-lowest hover:bg-surface-container-low transition-colors py-8 rounded-2xl cursor-pointer">
                             <div className="bg-primary/10 p-3 rounded-full text-primary">
                               <Upload className="w-6 h-6" />
                             </div>
                             <div className="text-center flex flex-col gap-1">
                               <span className="font-label text-base font-bold text-primary">Click to upload file</span>
                               <span className="font-body text-xs text-on-surface-variant">Max size 2MB</span>
                             </div>
                             <input type="file" className="hidden" onChange={(e) => handleFileUpload(a.assignment_student_id, e)} />
                         </label>
                     </div>
                     
                     <div className="flex items-center justify-end pt-4 mt-2 border-t border-outline-variant/20">
                        <button onClick={() => handleSubmitAssignment(a.assignment_student_id)} className="bg-primary text-on-primary hover:bg-primary/90 px-8 py-3 rounded-xl text-base font-label font-bold transition-all shadow-sm hover:shadow active:scale-[0.98]">
                           Submit Assignment
                        </button>
                     </div>
                 </div>
             )}
          </div>
       </div>

       {showBlankConfirm.show && showBlankConfirm.id !== null && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-xl flex flex-col">
               <div className="flex items-center gap-3 mb-4 text-warning">
                  <AlertCircle className="w-8 h-8" />
                  <h2 className="text-xl font-display font-bold text-on-surface">Blank Submission</h2>
               </div>
               <p className="text-on-surface-variant font-body mb-8">
                  You are about to submit a blank assignment without any text or attachments. Are you sure you want to continue?
               </p>
               <div className="flex gap-3 justify-end">
                  <button onClick={() => setShowBlankConfirm({show: false, id: null})} className="px-5 py-2.5 font-label font-bold text-on-surface hover:bg-surface-variant rounded-full transition-colors">
                     Cancel
                  </button>
                  <button onClick={() => executeSubmitAssignment(showBlankConfirm.id!)} className="px-5 py-2.5 font-label font-bold bg-primary text-on-primary hover:bg-primary/90 rounded-full transition-colors shadow-sm">
                     Submit Anyway
                  </button>
               </div>
            </div>
         </div>
       )}
    </div>
  );
}
