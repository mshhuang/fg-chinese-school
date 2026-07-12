import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { CheckCircle2, XCircle, Loader2, Camera, UploadCloud, StopCircle, User } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function QRScanner() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scannedUser, setScannedUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isOverriding, setIsOverriding] = useState(false);
  
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


  const confirmAction = async () => {
    if (!scannedUser) return;
    setLoading(true);
    setMessage(null);

    try {
      let actionType = '';
      let actionLabel = scannedUser.nextAction === 'check_out' ? 'checked out' : 'checked in';
      
      if (scannedUser.isStaff) {
          actionType = scannedUser.nextAction === 'check_out' ? 'clock_out' : 'clock_in';
          await supabase.from('staff_clock_ins').insert({
            user_id: scannedUser.user_id,
            action_type: actionType,
            daily_status: actionType === 'clock_out' ? 'classes over' : 'check-in the building'
          });
          await supabase.from('system_logs').insert({
            user_id: scannedUser.user_id,
            action_type: 'other',
            activity: `Staff ${actionLabel}`, page_name: 'QR Scanner', data_changed: { time: new Date().toISOString() },
            user_name: `${scannedUser.first_name} ${scannedUser.last_name}`
          });
      } else {
          actionType = scannedUser.nextAction === 'check_out' ? 'school_check_out' : 'school_check_in';
          const dailyStatus = scannedUser.nextAction === 'check_out' ? 'classes over' : 'check-in the building';
          await supabase.from('student_clock_ins').insert({
            student_id: scannedUser.user_id,
            action_type: actionType,
            daily_status: dailyStatus
          });
          await supabase.from('system_logs').insert({
            user_id: scannedUser.user_id,
            action_type: actionType,
            activity: `Student ${actionLabel}`, page_name: 'QR Scanner', data_changed: { time: new Date().toISOString() },
            user_name: `${scannedUser.first_name} ${scannedUser.last_name}`
          });
      }

      // Update attendance table for students
      const isCheckIn = actionType === 'school_check_in';
      if (isCheckIn) {
         const { data: enrolls } = await supabase.from('enrollments').select('class_id').eq('student_id', scannedUser.user_id).eq('status', 'Active');
         if (enrolls && enrolls.length > 0) {
            const today = new Date().toLocaleDateString('en-CA');
            for (const enroll of enrolls) {
               const { data: existing } = await supabase.from('attendance').select('attendance_id').eq('student_id', scannedUser.user_id).eq('class_id', enroll.class_id).eq('attendance_date', today);
               const newStatus = 'Present';
               if (!existing || existing.length === 0) {
                   await supabase.from('attendance').insert({
                       student_id: scannedUser.user_id,
                       class_id: enroll.class_id,
                       attendance_date: today,
                       status: newStatus
                   });
               } else {
                   await supabase.from('attendance').update({ status: newStatus }).eq('attendance_id', existing[0].attendance_id);
               }
            }
         }
      }

      setMessage({ type: 'success', text: `Successfully ${actionLabel} ${scannedUser.first_name} ${scannedUser.last_name}!` });
      setScannedUser(null);
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'An error occurred during check-in/out.' });
    }
    setLoading(false);
    
    setTimeout(() => {
      setScanResult(null);
      setMessage(null);
      isProcessingRef.current = false;
    }, 3000);
  };
  
  const handleOverride = async (status: string) => {
    if (!scannedUser) return;
    setLoading(true);
    setMessage(null);
    try {
      await supabase.from('system_logs').insert({
        user_id: scannedUser.user_id,
        action_type: status,
        activity: `User manually set to ${status}`, page_name: 'QR Scanner', data_changed: { time: new Date().toISOString(), manual_override: true },
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
         const { data: enrolls } = await supabase.from('enrollments').select('class_id').eq('student_id', scannedUser.user_id).eq('status', 'Active');
         if (enrolls && enrolls.length > 0) {
            const today = new Date().toLocaleDateString('en-CA');
            for (const enroll of enrolls) {
               const { data: existing } = await supabase.from('attendance').select('attendance_id').eq('student_id', scannedUser.user_id).eq('class_id', enroll.class_id).eq('attendance_date', today);
               let newStatus = 'Present';
               if (status === 'school_check_in_late') newStatus = 'Late';
               if (status === 'school_absent') newStatus = 'Absent';
               
               if (!existing || existing.length === 0) {
                   await supabase.from('attendance').insert({
                       student_id: scannedUser.user_id,
                       class_id: enroll.class_id,
                       attendance_date: today,
                       status: newStatus
                   });
               } else {
                   await supabase.from('attendance').update({ status: newStatus }).eq('attendance_id', existing[0].attendance_id);
               }
            }
         }
      }

      setMessage({ type: 'success', text: `Status manually set to ${status.replace('school_', '').replace('_', ' ')}!` });
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
  };

  const startCamera = async () => {
    if (scannerRef.current) {
        try {
            setMessage(null);
            isProcessingRef.current = false;
            setIsScanning(true);
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
            } catch (fallbackErr) {
                 setIsScanning(false);
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
        <div id="qr-reader-custom" className={`w-full overflow-hidden rounded-xl ${isScanning ? 'mb-6 border-2 border-outline-variant/50' : 'hidden'}`}></div>
        
        {scannedUser && !loading && !message && (
            <div className="flex flex-col gap-4 mb-6 animate-in fade-in zoom-in-95 duration-200">
               <div className="bg-surface-variant/30 p-6 rounded-2xl border border-outline-variant/30 text-center relative">
                  <div className="w-16 h-16 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center text-2xl font-display font-bold mx-auto mb-4 shadow-sm">
                     {scannedUser.first_name?.[0]}{scannedUser.last_name?.[0]}
                  </div>
                  <h3 className="font-title text-xl font-bold text-on-surface">{scannedUser.first_name} {scannedUser.last_name}</h3>
                  <p className="font-body text-sm text-on-surface-variant capitalize mt-1 flex items-center justify-center gap-1"><User className="w-4 h-4"/> {scannedUser.first_name ? "Scanned" : ""}</p>
               </div>
               
               {!isOverriding ? (
                 <div className="flex flex-col gap-3">
                   <div className="flex gap-3">
                      <button onClick={cancelCheckIn} className="flex-1 py-3 bg-surface-variant text-on-surface-variant rounded-xl font-label font-bold hover:bg-outline-variant/30 transition-all active:scale-95">Cancel</button>
                      <button onClick={confirmAction} className="flex-1 py-3 bg-primary text-on-primary rounded-xl font-label font-bold hover:bg-primary/90 transition-all shadow-sm active:scale-95">{scannedUser.nextAction === 'check_out' ? 'Confirm Check-out' : 'Confirm Check-in'}</button>
                   </div>
                   {!scannedUser.isStaff && <button onClick={() => setIsOverriding(true)} className="py-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors">Manual Override / Edit Status</button>}
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
          <div className={`p-4 rounded-xl flex items-start gap-3 ${message.type === 'success' ? 'bg-primary-container text-on-primary-container' : 'bg-error-container text-on-error-container'}`}>
             {message.type === 'success' ? <CheckCircle2 className="w-6 h-6 shrink-0" /> : <XCircle className="w-6 h-6 shrink-0" />}
             <span className="font-label font-bold">{message.text}</span>
          </div>
        )}
      </div>
    </div>
  );
}
