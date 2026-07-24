import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { CheckCircle2, XCircle, Loader2, Camera, UploadCloud, StopCircle, User, Activity, Clock } from "lucide-react";
import { supabase } from "../lib/supabase";
import { formatTeacherName } from "../lib/utils";
import { DuplicateClockWarningModal, ExistingClockRecord } from "../components/DuplicateClockWarningModal";

export default function QRScanner() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scannedUser, setScannedUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const [isOverriding, setIsOverriding] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [recentActivity, setRecentActivity] = useState<{name: string, action: string, time: string}[]>([]);
  const [duplicateWarning, setDuplicateWarning] = useState<{
    isOpen: boolean;
    userName: string;
    actionType: string;
    existingRecord: ExistingClockRecord | null;
    onUpdate: (recId: string | number | undefined, timeIso: string, reason?: string) => Promise<void>;
    onCreateNew?: (timeIso: string, reason?: string) => Promise<void>;
  } | null>(null);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    scannerRef.current = new Html5Qrcode("qr-reader-custom", false);
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const handleScanSuccess = async (decodedTextRaw: string) => {
    const decodedText = decodedTextRaw.trim();
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    
    // Stop scanner if using camera
    if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.pause();
        setTimeout(async () => {
             if (scannerRef.current && scannerRef.current.isScanning) {
                 await scannerRef.current.stop().catch(console.error);
                 setIsScanning(false);
                 setIsCameraStarting(false);
             }
        }, 100);
    }

    setScanResult(decodedText);
    setLoading(true);
    setMessage(null);
    setScannedUser(null);
      setIsOverriding(false);

    try {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('user_id, first_name, last_name, user_roles(roles(role_name))')
        .eq('user_id', decodedText)
        .single();

      if (userError || !user) {
        console.error("Supabase Error:", userError, "Decoded text:", decodedText);
        setMessage({ type: 'error', text: `Invalid QR code: ${decodedText.substring(0, 50)}` });
        setLoading(false);
        setTimeout(() => {
            setScanResult(null);
            setMessage(null);
            isProcessingRef.current = false;
        }, 3000);
        return;
      }
      
      const startOfDay = new Date();
      startOfDay.setHours(0,0,0,0);
      
      const roles = user.user_roles?.map((ur: any) => ur.roles?.role_name) || [];
      const isStaff = roles.some((r: string) => ['Teacher', 'Volunteer', 'Staff', 'Admin', 'Principal', 'Builder'].includes(r));
      
      let logs = null;
      if (isStaff) {
          const res = await supabase.from('staff_clock_ins').select('*').eq('user_id', user.user_id).gte('created_at', startOfDay.toISOString()).order('created_at', { ascending: false });
          logs = res.data;
      } else {
          const res = await supabase.from('student_clock_ins').select('*').eq('student_id', user.user_id).gte('created_at', startOfDay.toISOString()).order('created_at', { ascending: false });
          logs = res.data;
      }
      
      let nextAction = 'check_in';
      if (logs && logs.length > 0) {
          if (isStaff && logs[0].action_type === 'clock_in') nextAction = 'check_out';
          else if (!isStaff && logs[0].action_type === 'school_check_in') nextAction = 'check_out';
      }
      
      setScannedUser({ ...user, nextAction, isStaff });

      // Wait for user to confirm action.
      setLoading(false);
      return;

    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'An error occurred finding user information.' });
      setTimeout(() => {
          setScanResult(null);
          setMessage(null);
          isProcessingRef.current = false;
      }, 3000);
    }
    setLoading(false);
  };


  const updateStudentAttendance = async (studentId: string, statusOverride = 'Present') => {
    const { data: enrolls } = await supabase.from('enrollments').select('class_id').eq('student_id', studentId).eq('status', 'Active');
    if (enrolls && enrolls.length > 0) {
      const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
      for (const enroll of enrolls) {
        const { data: existing } = await supabase.from('attendance').select('attendance_id').eq('student_id', studentId).eq('class_id', enroll.class_id).eq('attendance_date', today);
        if (!existing || existing.length === 0) {
          await supabase.from('attendance').insert({
            student_id: studentId,
            class_id: enroll.class_id,
            attendance_date: today,
            status: statusOverride
          });
        } else {
          await supabase.from('attendance').update({ status: statusOverride }).eq('attendance_id', existing[0].attendance_id);
        }
      }
    }
  };

  const executeClockInOrOut = async (
    timeIso: string,
    reasonStr: string | undefined,
    isUpdate: boolean,
    existingRecId?: string | number
  ) => {
    if (!scannedUser) return;
    setLoading(true);
    setMessage(null);

    try {
      let actionType = '';
      let actionLabel = scannedUser.nextAction === 'check_out' ? 'checked out' : 'checked in';
      
      if (scannedUser.isStaff) {
        actionType = scannedUser.nextAction === 'check_out' ? 'clock_out' : 'clock_in';
      } else {
        actionType = scannedUser.nextAction === 'check_out' ? 'school_check_out' : 'school_check_in';
      }

      const table = scannedUser.isStaff ? 'staff_clock_ins' : 'student_clock_ins';
      const dailyStatus = reasonStr || explanation || (actionType.includes('out') ? 'classes over' : 'check-in the building');

      if (isUpdate) {
        if (existingRecId) {
          await supabase.from(table).update({
            created_at: timeIso,
            daily_status: dailyStatus
          }).eq('id', existingRecId);
        } else {
          const idCol = scannedUser.isStaff ? 'user_id' : 'student_id';
          await supabase.from(table).update({
            created_at: timeIso,
            daily_status: dailyStatus
          }).eq(idCol, scannedUser.user_id).eq('action_type', actionType);
        }
      } else {
        if (scannedUser.isStaff) {
          await supabase.from('staff_clock_ins').insert({
            user_id: scannedUser.user_id,
            action_type: actionType,
            daily_status: dailyStatus,
            created_at: timeIso
          });
        } else {
          await supabase.from('student_clock_ins').insert({
            student_id: scannedUser.user_id,
            action_type: actionType,
            daily_status: dailyStatus,
            created_at: timeIso
          });
        }
      }

      await supabase.from('system_logs').insert({
        user_id: scannedUser.user_id,
        action_type: actionType,
        activity: isUpdate ? `${scannedUser.isStaff ? 'Staff' : 'Student'} updated clock time (${actionLabel})` : `${scannedUser.isStaff ? 'Staff' : 'Student'} ${actionLabel}`,
        page_name: 'QR Scanner',
        data_changed: { time: new Date(timeIso).toLocaleString('en-US', { timeZone: 'America/New_York', timeZoneName: 'short' }), explanation: dailyStatus },
        user_name: `${scannedUser.first_name} ${scannedUser.last_name}`
      });

      if (!scannedUser.isStaff && (actionType === 'school_check_in' || actionType === 'clock_in')) {
        await updateStudentAttendance(scannedUser.user_id);
      }

      const timeString = new Date(timeIso).toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
      const nameStr = scannedUser.isStaff ? formatTeacherName(scannedUser.first_name, scannedUser.last_name, 'Teacher') : `${scannedUser.first_name} ${scannedUser.last_name}`;
      
      const successText = isUpdate
        ? `Successfully updated ${actionLabel} time for ${nameStr} to ${timeString}!`
        : `Successfully ${actionLabel} ${nameStr} at ${timeString}!`;

      setMessage({ type: 'success', text: successText });
      setRecentActivity(prev => [{ name: nameStr, action: isUpdate ? `Updated ${actionLabel}` : actionLabel, time: timeString }, ...prev].slice(0, 5));
      setScannedUser(null);
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'An error occurred during clock in/out.' });
    }
    setLoading(false);
    
    setTimeout(() => {
      setScanResult(null);
      setMessage(null);
      isProcessingRef.current = false;
    }, 3000);
  };

  const confirmAction = async () => {
    if (loading) return;
    if (!scannedUser) return;

    let actionType = scannedUser.isStaff
      ? (scannedUser.nextAction === 'check_out' ? 'clock_out' : 'clock_in')
      : (scannedUser.nextAction === 'check_out' ? 'school_check_out' : 'school_check_in');

    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    const table = scannedUser.isStaff ? 'staff_clock_ins' : 'student_clock_ins';
    const idCol = scannedUser.isStaff ? 'user_id' : 'student_id';

    const { data: todayLogs } = await supabase
      .from(table)
      .select('*')
      .eq(idCol, scannedUser.user_id)
      .gte('created_at', startOfDay.toISOString())
      .order('created_at', { ascending: false });

    const existingDup = todayLogs?.find((l: any) => l.action_type === actionType);

    if (existingDup) {
      setDuplicateWarning({
        isOpen: true,
        userName: scannedUser.isStaff
          ? formatTeacherName(scannedUser.first_name, scannedUser.last_name, 'Teacher')
          : `${scannedUser.first_name} ${scannedUser.last_name}`,
        actionType,
        existingRecord: existingDup,
        onUpdate: async (recId, timeIso, reasonStr) => {
          await executeClockInOrOut(timeIso, reasonStr, true, recId);
        },
        onCreateNew: async (timeIso, reasonStr) => {
          await executeClockInOrOut(timeIso, reasonStr, false);
        }
      });
      return;
    }

    await executeClockInOrOut(new Date().toISOString(), explanation, false);
  };
  
  const handleOverride = async (status: string) => {
    if (loading) return;
    if (!scannedUser) return;
    setLoading(true);
    setMessage(null);
    try {
      const actionType = status === 'school_check_out' ? (scannedUser.isStaff ? 'clock_out' : 'school_check_out') : (scannedUser.isStaff ? 'clock_in' : status);
      const startOfDay = new Date();
      startOfDay.setHours(0,0,0,0);
      const table = scannedUser.isStaff ? 'staff_clock_ins' : 'student_clock_ins';
      const idCol = scannedUser.isStaff ? 'user_id' : 'student_id';

      const { data: todayLogs } = await supabase
        .from(table)
        .select('*')
        .eq(idCol, scannedUser.user_id)
        .gte('created_at', startOfDay.toISOString())
        .order('created_at', { ascending: false });

      const existingDup = todayLogs?.find((l: any) => l.action_type === actionType);

      if (existingDup) {
        setLoading(false);
        setDuplicateWarning({
          isOpen: true,
          userName: scannedUser.isStaff
            ? formatTeacherName(scannedUser.first_name, scannedUser.last_name, 'Teacher')
            : `${scannedUser.first_name} ${scannedUser.last_name}`,
          actionType,
          existingRecord: existingDup,
          onUpdate: async (recId, timeIso, reasonStr) => {
            const dailyStatus = reasonStr || (status === 'school_check_out' ? 'classes over' : 'check-in the building');
            if (recId) {
              await supabase.from(table).update({ created_at: timeIso, daily_status: dailyStatus }).eq('id', recId);
            } else {
              await supabase.from(table).update({ created_at: timeIso, daily_status: dailyStatus }).eq(idCol, scannedUser.user_id).eq('action_type', actionType);
            }
            if (!scannedUser.isStaff) {
              await updateStudentAttendance(scannedUser.user_id, status === 'school_check_in_late' ? 'Late' : status === 'school_absent' ? 'Absent' : 'Present');
            }
            const timeString = new Date(timeIso).toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
            const nameStr = scannedUser.isStaff ? formatTeacherName(scannedUser.first_name, scannedUser.last_name, 'Teacher') : `${scannedUser.first_name} ${scannedUser.last_name}`;
            setMessage({ type: 'success', text: `Updated override status for ${nameStr} at ${timeString}` });
            setScannedUser(null);
            setIsOverriding(false);
          },
          onCreateNew: async (timeIso, reasonStr) => {
            const dailyStatus = reasonStr || (status === 'school_check_out' ? 'classes over' : 'check-in the building');
            if (scannedUser.isStaff) {
              await supabase.from('staff_clock_ins').insert({ user_id: scannedUser.user_id, action_type: status === 'school_check_out' ? 'clock_out' : 'clock_in', daily_status: dailyStatus, created_at: timeIso });
            } else {
              await supabase.from('student_clock_ins').insert({ student_id: scannedUser.user_id, action_type: status, daily_status: dailyStatus, created_at: timeIso });
            }
            if (!scannedUser.isStaff) {
              await updateStudentAttendance(scannedUser.user_id, status === 'school_check_in_late' ? 'Late' : status === 'school_absent' ? 'Absent' : 'Present');
            }
            const timeString = new Date(timeIso).toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
            const nameStr = scannedUser.isStaff ? formatTeacherName(scannedUser.first_name, scannedUser.last_name, 'Teacher') : `${scannedUser.first_name} ${scannedUser.last_name}`;
            setMessage({ type: 'success', text: `Manually set status for ${nameStr} to ${status.replace('school_', '').replace('_', ' ')} at ${timeString}` });
            setScannedUser(null);
            setIsOverriding(false);
          }
        });
        return;
      }

      await supabase.from('system_logs').insert({
        user_id: scannedUser.user_id,
        action_type: status,
        activity: `User manually set to ${status}`, page_name: 'QR Scanner', data_changed: { time: new Date().toLocaleString('en-US', { timeZone: 'America/New_York' , timeZoneName: 'short'}), manual_override: true },
        user_name: `${scannedUser.first_name} ${scannedUser.last_name}`
      });

      // Also add to clock ins
      if (scannedUser.isStaff) {
          await supabase.from('staff_clock_ins').insert({
             user_id: scannedUser.user_id,
             action_type: status === 'school_check_out' ? 'clock_out' : 'clock_in',
             daily_status: status === 'school_check_out' ? 'classes over' : 'check-in the building'
          });
      } else {
          await supabase.from('student_clock_ins').insert({
             student_id: scannedUser.user_id,
             action_type: status,
             daily_status: status === 'school_check_out' ? 'classes over' : 'check-in the building'
          });
      }

      // Update attendance table for students
      const isCheckInStatus = status === 'school_check_in' || status === 'school_check_in_late' || status === 'school_absent';
      if (isCheckInStatus) {
        await updateStudentAttendance(scannedUser.user_id, status === 'school_check_in_late' ? 'Late' : status === 'school_absent' ? 'Absent' : 'Present');
      }

      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', { timeZone: 'America/New_York',  hour: '2-digit', minute: '2-digit' , timeZoneName: 'short'});
      const nameStr = scannedUser.isStaff ? formatTeacherName(scannedUser.first_name, scannedUser.last_name, 'Teacher') : `${scannedUser.first_name} ${scannedUser.last_name}`;
      setMessage({ type: 'success', text: `Status manually set to ${status.replace('school_', '').replace('_', ' ')} at ${timeString}!` });
      setRecentActivity(prev => [{ name: nameStr, action: `Manual: ${status.replace('school_', '').replace('_', ' ')}`, time: timeString }, ...prev].slice(0, 5));
      setScannedUser(null);
      setIsOverriding(false);
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'An error occurred during override.' });
    }
    setLoading(false);
    
    setTimeout(() => {
      setScanResult(null);
      setMessage(null);
      isProcessingRef.current = false;
    }, 3000);
  };

  const cancelCheckIn = () => {
      isProcessingRef.current = false;
      setScannedUser(null);
      setScanResult(null);
      setMessage(null);
      setShowExplanation(false);
      setExplanation('');
  };

  const startCamera = async () => {
    if (scannerRef.current) {
        try {
            setMessage(null);
            isProcessingRef.current = false;
            setIsScanning(true);
            setIsCameraStarting(true);
            await new Promise(resolve => setTimeout(resolve, 100));
            // Try to get available cameras
            const devices = await Html5Qrcode.getCameras();
            let cameraIdOrConfig: string | { facingMode: string } = { facingMode: "environment" };
            
            if (devices && devices.length > 0) {
                // If there's a back camera, try to use it, else just use the first available
                const backCamera = devices.find(d => d.label.toLowerCase().includes('back'));
                if (backCamera) {
                    cameraIdOrConfig = backCamera.id;
                } else {
                    cameraIdOrConfig = devices[0].id;
                }
            }

            await scannerRef.current.start(
                cameraIdOrConfig,
                { fps: 10, disableFlip: false },
                handleScanSuccess,
                (errorMessage) => {
                    // console.log("QR Scan Error: ", errorMessage); // This can be noisy
                }
            );
            setIsCameraStarting(false);
        } catch (err) {
            console.error(err);
            // Fallback for laptops where getCameras might have issues
            try {
                await scannerRef.current.start(
                    { facingMode: "user" },
                    { fps: 10, disableFlip: false },
                    handleScanSuccess,
                    () => {}
                );
                setIsCameraStarting(false);
            } catch (fallbackErr) {
                 setIsScanning(false);
                 setIsCameraStarting(false);
                 console.error(fallbackErr);
                 setMessage({ type: 'error', text: 'Could not start camera. Please check permissions.' });
            }
        }
    }
  };

  const stopCamera = async () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
          try {
              await scannerRef.current.stop();
              setIsScanning(false);
              setIsCameraStarting(false);
          } catch(err) {
              console.error(err);
          }
      }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          const file = e.target.files[0];
          if (scannerRef.current) {
              try {
                  setMessage(null);
                  if (scannerRef.current.isScanning) {
                      await scannerRef.current.stop();
                      setIsScanning(false);
                  }
                  const decodedText = await scannerRef.current.scanFile(file, true);
                  handleScanSuccess(decodedText);
              } catch (err) {
                  // console.error(err);
                  setMessage({ type: 'error', text: 'Could not find a valid QR code in the image.' });
              }
          }
      }
      e.target.value = '';
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto w-full">
      <h1 className="font-display text-4xl text-on-surface font-bold tracking-tight mb-2">School Check-in Scanner</h1>
      <p className="font-body text-on-surface-variant max-w-2xl text-lg mb-8">
        Scan QR codes to record daily building arrival for students, teachers, and staff.
      </p>

      <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/30 shadow-sm max-w-md mx-auto">
        <div className="relative">
          <div id="qr-reader-custom" className={`w-full overflow-hidden rounded-xl ${isScanning ? 'mb-6 border-2 border-outline-variant/50' : 'hidden'}`}></div>
          {isCameraStarting && (
            <div className="absolute top-0 left-0 right-0 bottom-6 z-10 flex flex-col items-center justify-center bg-surface-container-lowest/80 backdrop-blur-sm rounded-xl border-2 border-outline-variant/50">
               <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
               <p className="text-sm font-label font-bold text-primary">Starting camera...</p>
            </div>
          )}
        </div>
        
        {scannedUser && !loading && !message && (
            <div className="flex flex-col gap-4 mb-6 animate-in fade-in zoom-in-95 duration-200">
               <div className="bg-surface-variant/30 p-6 rounded-2xl border border-outline-variant/30 text-center relative">
                  <div className="w-16 h-16 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center text-2xl font-display font-bold mx-auto mb-4 shadow-sm">
                     {scannedUser.first_name?.[0]}{scannedUser.last_name?.[0]}
                  </div>
                  <h3 className="font-title text-xl font-bold text-on-surface">
                     {scannedUser.isStaff ? formatTeacherName(scannedUser.first_name, scannedUser.last_name, 'Teacher') : `${scannedUser.first_name} ${scannedUser.last_name}`}
                  </h3>
                  <p className="font-body text-sm text-on-surface-variant capitalize mt-1 flex items-center justify-center gap-1"><User className="w-4 h-4"/> {scannedUser.first_name ? "Scanned" : ""}</p>
               </div>
               
               {!isOverriding ? (
                 <div className="flex flex-col gap-3">
                   <p className="font-title text-lg font-bold text-on-surface text-center mb-1">
                     Are you checking {scannedUser.nextAction === 'check_out' ? 'out from' : 'in to'} the school building?
                   </p>
                   {!showExplanation ? (
                     <>
                       <div className="flex gap-3">
                          <button onClick={() => setShowExplanation(true)} className="flex-1 py-3 bg-surface-variant text-on-surface-variant rounded-xl font-label font-bold hover:bg-outline-variant/30 transition-all active:scale-95">No</button>
                          <button onClick={confirmAction} className="flex-1 py-3 bg-primary text-on-primary rounded-xl font-label font-bold hover:bg-primary/90 transition-all shadow-sm active:scale-95">Yes, {scannedUser.nextAction === 'check_out' ? 'Confirm Check-out' : 'Confirm Check-in'}</button>
                       </div>
                       {!scannedUser.isStaff && <button onClick={() => setIsOverriding(true)} className="py-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors">Manual Override / Edit Status</button>}
                       <button onClick={cancelCheckIn} className="py-2 text-sm font-bold text-on-surface-variant hover:text-on-surface transition-colors">Cancel Scan</button>
                     </>
                   ) : (
                       <div className="flex flex-col gap-3">
                           <textarea 
                             className="w-full bg-surface-container rounded-xl p-3 border border-outline-variant/50 font-body text-sm text-on-surface resize-none focus:outline-none focus:border-primary"
                             placeholder="Please explain why..."
                             rows={3}
                             value={explanation}
                             onChange={(e) => setExplanation(e.target.value)}
                           />
                           <div className="flex gap-2">
                             <button onClick={() => { setShowExplanation(false); setExplanation(""); }} className="flex-1 py-3 bg-surface-variant text-on-surface-variant rounded-xl font-label font-bold hover:bg-outline-variant/30 transition-all active:scale-95">Back</button>
                             <button onClick={confirmAction} disabled={!explanation.trim()} className="flex-1 py-3 bg-primary text-on-primary rounded-xl font-label font-bold hover:bg-primary/90 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">Confirm</button>
                           </div>
                       </div>
                   )}
                 </div>
               ) : (
                 <div className="flex flex-col gap-3 p-4 bg-surface-container-low rounded-xl border border-outline-variant/30">
                   <h4 className="font-label font-bold text-on-surface mb-2">Select Manual Status</h4>
                   <div className="grid grid-cols-2 gap-2">
                     <button onClick={() => handleOverride('school_check_in')} className="py-2 bg-primary-container text-on-primary-container rounded-lg font-bold text-sm hover:bg-primary-container/80 transition-colors">Present (In)</button>
                     <button onClick={() => handleOverride('school_check_in_late')} className="py-2 bg-tertiary-container text-on-tertiary-container rounded-lg font-bold text-sm hover:bg-tertiary-container/80 transition-colors">Late (In)</button>
                     <button onClick={() => handleOverride('school_absent')} className="py-2 bg-error-container text-on-error-container rounded-lg font-bold text-sm hover:bg-error-container/80 transition-colors">Absent</button>
                     <button onClick={() => handleOverride('school_check_out')} className="py-2 bg-secondary-container text-on-secondary-container rounded-lg font-bold text-sm hover:bg-secondary-container/80 transition-colors">Check-out</button>
                   </div>
                   <button onClick={() => setIsOverriding(false)} className="mt-2 py-2 text-sm font-bold text-on-surface-variant hover:text-on-surface transition-colors">Back</button>
                 </div>
               )}
            </div>
        )}

        {!isScanning && !loading && !scannedUser && (
            <div className="flex flex-col gap-4 mb-6">
                <button onClick={startCamera} className="flex items-center justify-center gap-2 w-full py-4 bg-primary text-on-primary rounded-2xl font-label font-bold hover:bg-primary/90 transition-all shadow-sm active:scale-95">
                    <Camera className="w-5 h-5" /> Start Camera
                </button>
                <div className="relative">
                    <input type="file" accept=".jpg,.jpeg,.png,.gif" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <button className="flex items-center justify-center gap-2 w-full py-4 bg-secondary-container text-on-secondary-container rounded-2xl font-label font-bold hover:bg-secondary-container/90 transition-all shadow-sm pointer-events-none active:scale-95">
                        <UploadCloud className="w-5 h-5" /> Upload QR Image
                    </button>
                </div>
            </div>
        )}

        {isScanning && (
            <button onClick={stopCamera} className="flex items-center justify-center gap-2 w-full py-3 mb-6 bg-error-container text-on-error-container rounded-2xl font-label font-bold hover:bg-error-container/90 transition-all shadow-sm active:scale-95">
                <StopCircle className="w-5 h-5" /> Stop Camera
            </button>
        )}
        
        {loading && (
          <div className="flex items-center justify-center gap-2 text-primary font-bold mb-6">
            <Loader2 className="w-5 h-5 animate-spin" /> Processing...
          </div>
        )}

        {message && (
          <div className={`p-4 rounded-xl flex items-start gap-3 mb-6 ${message.type === 'success' ? 'bg-primary-container text-on-primary-container' : 'bg-error-container text-on-error-container'}`}>
             {message.type === 'success' ? <CheckCircle2 className="w-6 h-6 shrink-0" /> : <XCircle className="w-6 h-6 shrink-0" />}
             <span className="font-label font-bold">{message.text}</span>
          </div>
        )}

        {recentActivity.length > 0 && (
          <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/30 mt-auto">
            <h3 className="font-label font-bold text-on-surface mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> Recent Activity
            </h3>
            <div className="flex flex-col gap-2">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-outline-variant/20 last:border-0 last:pb-0">
                  <div className="flex flex-col">
                    <span className="font-body text-sm font-medium text-on-surface">{activity.name}</span>
                    <span className="font-body text-xs text-on-surface-variant capitalize">{activity.action}</span>
                  </div>
                  <div className="flex items-center gap-1 text-on-surface-variant bg-surface-container py-1 px-2 rounded-lg">
                    <Clock className="w-3 h-3" />
                    <span className="font-mono text-xs">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {duplicateWarning && (
          <DuplicateClockWarningModal
            isOpen={duplicateWarning.isOpen}
            onClose={() => setDuplicateWarning(null)}
            userName={duplicateWarning.userName}
            actionType={duplicateWarning.actionType}
            existingRecord={duplicateWarning.existingRecord}
            onUpdateExisting={duplicateWarning.onUpdate}
            onCreateNew={duplicateWarning.onCreateNew}
          />
        )}
      </div>
    </div>
  );
}
