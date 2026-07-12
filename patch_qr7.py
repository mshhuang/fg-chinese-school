import re

with open('src/pages/QRScanner.tsx', 'r') as f:
    content = f.read()

# For the initial load/scan
target_logic1 = """      if (isStaff) {
          const res = await supabase.from('staff_clock_ins').select('*').eq('user_id', user.user_id).gte('created_at', startOfDay.toISOString()).order('created_at', { ascending: false });
          logs = res.data;
      } else {
          const res = await supabase.from('system_logs').select('*').eq('user_id', user.user_id).in('action_type', ['school_check_in', 'school_check_out']).gte('created_at', startOfDay.toISOString()).order('created_at', { ascending: false });
          logs = res.data;
      }"""

replacement_logic1 = """      if (isStaff) {
          const res = await supabase.from('staff_clock_ins').select('*').eq('user_id', user.user_id).gte('created_at', startOfDay.toISOString()).order('created_at', { ascending: false });
          logs = res.data;
      } else {
          const res = await supabase.from('student_clock_ins').select('*').eq('student_id', user.user_id).gte('created_at', startOfDay.toISOString()).order('created_at', { ascending: false });
          logs = res.data;
      }"""

content = content.replace(target_logic1, replacement_logic1)

target_logic2 = """      } else {
          actionType = nextAction === 'check_out' ? 'school_check_out' : 'school_check_in';
          await supabase.from('system_logs').insert({
            user_id: user.user_id,
            action_type: actionType,
            activity: `Student ${actionLabel}`, page_name: 'QR Scanner', data_changed: { time: new Date().toISOString() },
            user_name: `${user.first_name} ${user.last_name}`
          });
      }"""

replacement_logic2 = """      } else {
          actionType = nextAction === 'check_out' ? 'school_check_out' : 'school_check_in';
          const dailyStatus = nextAction === 'check_out' ? 'classes over' : 'check-in the building';
          await supabase.from('student_clock_ins').insert({
            student_id: user.user_id,
            action_type: actionType,
            daily_status: dailyStatus
          });
          await supabase.from('system_logs').insert({
            user_id: user.user_id,
            action_type: actionType,
            activity: `Student ${actionLabel}`, page_name: 'QR Scanner', data_changed: { time: new Date().toISOString() },
            user_name: `${user.first_name} ${user.last_name}`
          });
      }"""

content = content.replace(target_logic2, replacement_logic2)

# For confirmAction
target_logic3 = """      } else {
          actionType = scannedUser.nextAction === 'check_out' ? 'school_check_out' : 'school_check_in';
          await supabase.from('system_logs').insert({
            user_id: scannedUser.user_id,
            action_type: actionType,
            activity: `Student ${actionLabel}`, page_name: 'QR Scanner', data_changed: { time: new Date().toISOString() },
            user_name: `${scannedUser.first_name} ${scannedUser.last_name}`
          });
      }"""

replacement_logic3 = """      } else {
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
      }"""

content = content.replace(target_logic3, replacement_logic3)

with open('src/pages/QRScanner.tsx', 'w') as f:
    f.write(content)
print("QR Scanner patched for student clock ins!")
