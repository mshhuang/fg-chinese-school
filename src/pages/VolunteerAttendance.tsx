import React, { useState, useEffect } from "react";
import { ClipboardList, Loader2, Send, CheckCircle2, AlertCircle, RefreshCw, PenSquare } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function VolunteerAttendance() {
  const navigate = useNavigate();
  const [report, setReport] = useState<any[]>([]);
  const [unsubmittedClasses, setUnsubmittedClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ present: 0, absent: 0 });
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchReport();
    const fetchUser = async () => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          setUser(JSON.parse(userStr));
        } catch (e) {}
      }
    };
    fetchUser();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    const today = new Date().toLocaleDateString('en-CA');
    
    // Fetch all attendance for today
    const { data: attData, error: attError } = await supabase.from('attendance')
      .select('*, classes(class_name)')
      .eq('attendance_date', today);
      
    // Fetch all classes to see which ones are missing
    const { data: allClasses } = await supabase.from('classes').select('class_id, class_name').order('class_name');
      
    const { data: enrollments } = await supabase.from('enrollments').select('class_id');
    const classEnrollments: Record<string, number> = {};
    if (enrollments) {
        enrollments.forEach(e => {
            if (e.class_id) {
                classEnrollments[e.class_id] = (classEnrollments[e.class_id] || 0) + 1;
            }
        });
    }
      
    if (!attError && attData && allClasses) {
      const classMap: Record<string, { present: number, absent: number, className: string }> = {};
      let totP = 0;
      let totA = 0;
      
      const submittedClassIds = new Set<string>();
      
      attData.forEach(r => {
        const cId = r.class_id || 'unknown';
        submittedClassIds.add(cId);
        if (!classMap[cId]) {
           classMap[cId] = { 
              className: (r.classes as any)?.class_name || 'Unknown Class', 
              present: 0, 
              absent: 0 
           };
        }
        if (r.status === 'Present') {
           classMap[cId].present++;
           totP++;
        } else if (r.status === 'Absent') {
           classMap[cId].absent++;
           totA++;
        }
      });
      
      const mappedReport = Object.keys(classMap).map(cId => {
         const r = classMap[cId];
         const total = classEnrollments[cId] || (r.present + r.absent);
         const rate = total > 0 ? Math.round((r.present / total) * 100) : 0;
         return { ...r, total, rate };
      }).sort((a,b) => a.className.localeCompare(b.className));
      
      setReport(mappedReport);
      setTotals({ present: totP, absent: totA });
      
      const unsubmitted = allClasses.filter(c => !submittedClassIds.has(c.class_id));
      setUnsubmittedClasses(unsubmitted);
    }
    setLoading(false);
  };

  const handleSendToAdmin = async () => {
    if (!user) {
      setErrorMsg('User session not found. Please log in again.');
      setTimeout(() => setErrorMsg(""), 3000);
      return;
    }
    setSending(true);
    
    // Find School Admin role_id
    const { data: roles } = await supabase.from('roles').select('role_id').eq('role_name', 'Admin');
    if (roles && roles.length > 0) {
      const adminRoleId = roles[0].role_id;
      const { data: adminUsers } = await supabase.from('user_roles')
        .select('user_id')
        .eq('role_id', adminRoleId);
        
      if (adminUsers && adminUsers.length > 0) {
        const adminId = adminUsers[0].user_id;
      
      const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      const reportBody = `Attendance Report for ${todayStr}:\n\nTotal Present: ${totals.present}\nTotal Absent: ${totals.absent}\n\n` + 
         report.map(r => `${r.className}: ${r.present} Present, ${r.absent} Absent`).join('\n');
         
      const { error } = await supabase.from('internal_messages').insert({
         sender_id: user.id,
         recipient_id: adminId,
         body: reportBody
      });
      
      if (!error) {
         setSuccessMsg('Report successfully sent to School Admin.');
         setTimeout(() => setSuccessMsg(""), 3000);
      } else {
         setErrorMsg('Failed to send report.');
         setTimeout(() => setErrorMsg(""), 3000);
      }
      } else {
        setErrorMsg('School Admin not found.');
        setTimeout(() => setErrorMsg(""), 3000);
      }
    } else {
      setErrorMsg('Admin role not found.');
      setTimeout(() => setErrorMsg(""), 3000);
    }
    
    setSending(false);
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto w-full">
      <h1 className="font-display text-4xl text-on-surface font-bold tracking-tight mb-2">Daily Attendance Report</h1>
      <p className="font-body text-on-surface-variant max-w-2xl text-lg mb-8">
        Calculate the total absent and present students across all classes and send the report to the school admin.
      </p>

      <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/30 shadow-[0_8px_30px_rgba(212,175,55,0.05)]">
         <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <h2 className="font-title text-2xl text-on-surface font-bold flex items-center gap-3">
               <ClipboardList className="text-secondary w-6 h-6" /> 
               Today's Summary
            </h2>
            <div className="flex items-center gap-3">
               <button 
                  onClick={fetchReport}
                  disabled={loading}
                  className="flex items-center justify-center p-2 rounded-lg bg-surface-container hover:bg-surface-variant text-on-surface-variant transition-colors disabled:opacity-50 border border-outline-variant/20 hover:border-primary/30"
                  title="Refresh Report"
               >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary' : ''}`} />
               </button>
               <div className="font-label text-sm text-on-surface-variant bg-surface-container py-1.5 px-3 rounded-lg border border-outline-variant/20 whitespace-nowrap">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
               </div>
            </div>
         </div>
         
         {loading ? (
            <div className="py-12 text-center text-on-surface-variant flex justify-center items-center gap-2">
               <Loader2 className="w-5 h-5 animate-spin" /> Calculating...
            </div>
         ) : report.length === 0 ? (
            <div className="py-12 text-center text-on-surface-variant">
               No attendance records submitted by teachers yet today.
            </div>
         ) : (
            <>
               <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20">
                     <div className="font-label text-sm font-bold text-primary uppercase tracking-wider mb-2">Total Present</div>
                     <div className="font-display text-4xl font-bold text-primary">{totals.present}</div>
                  </div>
                  <div className="bg-error/10 rounded-2xl p-6 border border-error/20">
                     <div className="font-label text-sm font-bold text-error uppercase tracking-wider mb-2">Total Absent</div>
                     <div className="font-display text-4xl font-bold text-error">{totals.absent}</div>
                  </div>
               </div>
               
               <h3 className="font-title text-lg text-on-surface font-bold mb-4">Breakdown by Class</h3>
               <div className="bg-surface-container-low rounded-2xl border border-outline-variant/20 overflow-hidden mb-8">
                  <div className="divide-y divide-outline-variant/10">
                     {report.map((r, i) => (
                        <div key={i} className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 p-4 hover:bg-surface-container-lowest transition-colors">
                           <div className="font-body font-bold text-on-surface">{r.className}</div>
                           <div className="flex gap-4 font-label text-sm items-center flex-wrap">
                              <span className="text-on-surface-variant font-medium">Total: {r.total}</span>
                              <span className="text-primary font-medium">{r.present} Present</span>
                              <span className="text-error font-medium">{r.absent} Absent</span>
                              <span className="bg-primary/10 text-primary px-2 py-1 rounded-md ml-2">{r.rate}% 出席率</span>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
               
               {unsubmittedClasses.length > 0 && (
                 <>
                   <h3 className="font-title text-lg text-on-surface font-bold mb-4 text-amber-600">Pending Attendance</h3>
                   <div className="bg-amber-50 rounded-2xl border border-amber-200 overflow-hidden mb-8">
                      <div className="divide-y divide-amber-100">
                         {unsubmittedClasses.map((c, i) => (
                            <div key={i} className="flex justify-between items-center p-4 text-on-surface-variant">
                               <div className="font-body font-medium">{c.class_name}</div>
                               <div className="flex items-center gap-3">
                                  <div className="font-label text-sm text-amber-600 font-bold hidden sm:block">Not Submitted</div>
                                  <button 
                                     onClick={() => navigate('/volunteer/enter-attendance', { state: { class: c } })}
                                     className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg font-label text-xs font-bold transition-colors"
                                  >
                                     <PenSquare className="w-3.5 h-3.5" />
                                     Enter
                                  </button>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
                 </>
               )}
               
               <div className="flex items-center justify-end gap-3 mt-6 border-t border-outline-variant/20 pt-6">
                 {successMsg && (
                    <div className="flex items-center text-primary font-label text-sm font-bold animate-in fade-in zoom-in duration-300">
                       <CheckCircle2 className="w-5 h-5 mr-2" />
                       {successMsg}
                    </div>
                 )}
                 {errorMsg && (
                    <div className="flex items-center text-error font-label text-sm font-bold animate-in fade-in zoom-in duration-300">
                       <AlertCircle className="w-5 h-5 mr-2" />
                       {errorMsg}
                    </div>
                 )}
                 <button 
                    onClick={handleSendToAdmin}
                    disabled={sending}
                    className="bg-primary text-on-primary px-8 py-3 rounded-xl font-label text-sm font-bold shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                 >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {sending ? 'Sending...' : 'Present to School Admin'}
                 </button>
               </div>
            </>
         )}
      </div>
    </div>
  );
}
