cat src/pages/StudentPortal.tsx | head -n 172 > StudentPortal_temp.tsx
cat << 'INNER_EOF' >> StudentPortal_temp.tsx
    const fetchCheckInStatus = async (studentId: string) => {
     if (!studentId) {
        setCheckInStatus("not_checked_in");
        return;
     }
     setCheckInStatus('loading');
     setCheckInTime('');
     const startOfDay = new Date();
     startOfDay.setHours(0,0,0,0);
     try {
       const { data, error } = await supabase
         .from('student_clock_ins')
         .select('*')
         .eq('student_id', studentId)
         .gte('created_at', startOfDay.toISOString())
         .order('created_at', { ascending: false })
         .limit(1);
         
       if (error) throw error;
       
       if (data && data.length > 0) {
          if (data[0].action_type === 'school_check_in') {
              setCheckInStatus('checked_in');
              setCheckInTime(data[0].created_at);
          } else if (data[0].action_type === 'school_check_out') {
              setCheckInStatus('checked_out');
              setCheckInTime(data[0].created_at);
          } else {
              setCheckInStatus('not_checked_in');
          }
       } else {
          setCheckInStatus('not_checked_in');
       }
     } catch (err) {
       console.error("Error fetching check in status:", err);
       setCheckInStatus('not_checked_in');
     }
  };
INNER_EOF
cat src/pages/StudentPortal.tsx | tail -n +210 >> StudentPortal_temp.tsx
mv StudentPortal_temp.tsx src/pages/StudentPortal.tsx
