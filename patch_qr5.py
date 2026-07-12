import re

with open('src/pages/QRScanner.tsx', 'r') as f:
    content = f.read()

target = r"""      // Auto check-in/out logic
      if \(isStaff\) \{
          const actionType = nextAction === 'check_out' \? 'clock_out' : 'clock_in';
          await supabase\.from\('staff_clock_ins'\)\.insert\(\{
            user_id: user\.user_id,
            action_type: actionType
          \}\);
          const actionLabel = nextAction === 'check_out' \? 'checked out' : 'checked in';
          await supabase\.from\('system_logs'\)\.insert\(\{
            user_id: user\.user_id,
            action_type: 'other',
            activity: `Staff \$\{actionLabel\}`, page_name: 'QR Scanner', data_changed: \{ time: new Date\(\)\.toISOString\(\) \},
            user_name: `\$\{user\.first_name\} \$\{user\.last_name\}`
          \}\);
      \} else \{
          const actionType = nextAction === 'check_out' \? 'school_check_out' : 'school_check_in';
          const actionLabel = nextAction === 'check_out' \? 'checked out' : 'checked in';
          await supabase\.from\('system_logs'\)\.insert\(\{
            user_id: user\.user_id,
            action_type: actionType,
            activity: `Student \$\{actionLabel\}`, page_name: 'QR Scanner', data_changed: \{ time: new Date\(\)\.toISOString\(\) \},
            user_name: `\$\{user\.first_name\} \$\{user\.last_name\}`
          \}\);
      \}"""

replacement = """      // Auto check-in/out logic
      let actionType = '';
      let actionLabel = nextAction === 'check_out' ? 'checked out' : 'checked in';
      
      if (isStaff) {
          actionType = nextAction === 'check_out' ? 'clock_out' : 'clock_in';
          await supabase.from('staff_clock_ins').insert({
            user_id: user.user_id,
            action_type: actionType
          });
          await supabase.from('system_logs').insert({
            user_id: user.user_id,
            action_type: 'other',
            activity: `Staff ${actionLabel}`, page_name: 'QR Scanner', data_changed: { time: new Date().toISOString() },
            user_name: `${user.first_name} ${user.last_name}`
          });
      } else {
          actionType = nextAction === 'check_out' ? 'school_check_out' : 'school_check_in';
          await supabase.from('system_logs').insert({
            user_id: user.user_id,
            action_type: actionType,
            activity: `Student ${actionLabel}`, page_name: 'QR Scanner', data_changed: { time: new Date().toISOString() },
            user_name: `${user.first_name} ${user.last_name}`
          });
      }"""

content = re.sub(target, replacement, content)

with open('src/pages/QRScanner.tsx', 'w') as f:
    f.write(content)
print("QR Scanner scoping fixed!")
