import re

with open('src/pages/QRScanner.tsx', 'r') as f:
    content = f.read()

# 1. Update the select query to fetch roles
target_select = """      const { data: user, error: userError } = await supabase
        .from('users')
        .select('user_id, first_name, last_name')
        .eq('user_id', decodedText)
        .single();"""

replacement_select = """      const { data: user, error: userError } = await supabase
        .from('users')
        .select('user_id, first_name, last_name, user_roles(roles(role_name))')
        .eq('user_id', decodedText)
        .single();"""

content = content.replace(target_select, replacement_select)

# 2. Add isStaff flag and modify log insertion
target_logic = """      const startOfDay = new Date();
      startOfDay.setHours(0,0,0,0);
      
      const { data: logs } = await supabase
        .from('system_logs')
        .select('*')
        .eq('user_id', user.user_id)
        .in('action_type', ['school_check_in', 'school_check_out'])
        .gte('created_at', startOfDay.toISOString())
        .order('created_at', { ascending: false });
      
      let nextAction = 'check_in';
      if (logs && logs.length > 0) {
          if (logs[0].action_type === 'school_check_in') {
              nextAction = 'check_out';
          }
      }
      
      setScannedUser({ ...user, nextAction });

      // Auto check-in/out logic
      const actionType = nextAction === 'check_out' ? 'school_check_out' : 'school_check_in';
      const actionLabel = nextAction === 'check_out' ? 'checked out' : 'checked in';

      await supabase.from('system_logs').insert({
        user_id: user.user_id,
        action_type: actionType,
        activity: `User ${actionLabel}`, page_name: 'QR Scanner', data_changed: { time: new Date().toISOString() },
        user_name: `${user.first_name} ${user.last_name}`
      });"""

replacement_logic = """      const startOfDay = new Date();
      startOfDay.setHours(0,0,0,0);
      
      const roles = user.user_roles?.map((ur: any) => ur.roles?.role_name) || [];
      const isStaff = roles.some((r: string) => ['Teacher', 'Volunteer', 'Staff', 'Admin', 'Principal', 'Builder'].includes(r));
      
      let logs = null;
      if (isStaff) {
          const res = await supabase.from('staff_clock_ins').select('*').eq('user_id', user.user_id).gte('created_at', startOfDay.toISOString()).order('created_at', { ascending: false });
          logs = res.data;
      } else {
          const res = await supabase.from('system_logs').select('*').eq('user_id', user.user_id).in('action_type', ['school_check_in', 'school_check_out']).gte('created_at', startOfDay.toISOString()).order('created_at', { ascending: false });
          logs = res.data;
      }
      
      let nextAction = 'check_in';
      if (logs && logs.length > 0) {
          if (isStaff && logs[0].action_type === 'clock_in') nextAction = 'check_out';
          else if (!isStaff && logs[0].action_type === 'school_check_in') nextAction = 'check_out';
      }
      
      setScannedUser({ ...user, nextAction, isStaff });

      // Auto check-in/out logic
      if (isStaff) {
          const actionType = nextAction === 'check_out' ? 'clock_out' : 'clock_in';
          await supabase.from('staff_clock_ins').insert({
            user_id: user.user_id,
            action_type: actionType
          });
          const actionLabel = nextAction === 'check_out' ? 'checked out' : 'checked in';
          await supabase.from('system_logs').insert({
            user_id: user.user_id,
            action_type: 'other',
            activity: `Staff ${actionLabel}`, page_name: 'QR Scanner', data_changed: { time: new Date().toISOString() },
            user_name: `${user.first_name} ${user.last_name}`
          });
      } else {
          const actionType = nextAction === 'check_out' ? 'school_check_out' : 'school_check_in';
          const actionLabel = nextAction === 'check_out' ? 'checked out' : 'checked in';
          await supabase.from('system_logs').insert({
            user_id: user.user_id,
            action_type: actionType,
            activity: `Student ${actionLabel}`, page_name: 'QR Scanner', data_changed: { time: new Date().toISOString() },
            user_name: `${user.first_name} ${user.last_name}`
          });
      }"""

content = content.replace(target_logic, replacement_logic)

with open('src/pages/QRScanner.tsx', 'w') as f:
    f.write(content)
print("QR Scanner Patched successfully!")
