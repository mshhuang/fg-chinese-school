import re

with open('src/pages/QRScanner.tsx', 'r') as f:
    content = f.read()

target = r"""  const confirmAction = async \(\) => \{
    if \(!scannedUser\) return;
    setLoading\(true\);
    setMessage\(null\);

    try \{
      const actionType = scannedUser\.nextAction === 'check_out' \? 'school_check_out' : 'school_check_in';
      const actionLabel = scannedUser\.nextAction === 'check_out' \? 'checked out' : 'checked in';
      
      await supabase\.from\('system_logs'\)\.insert\(\{
        user_id: scannedUser\.user_id,
        action_type: actionType,
        activity: `User \$\{actionLabel\}`, page_name: 'QR Scanner', data_changed: \{ time: new Date\(\)\.toISOString\(\) \},
        user_name: `\$\{scannedUser\.first_name\} \$\{scannedUser\.last_name\}`
      \}\);"""

replacement = """  const confirmAction = async () => {
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
            action_type: actionType
          });
          await supabase.from('system_logs').insert({
            user_id: scannedUser.user_id,
            action_type: 'other',
            activity: `Staff ${actionLabel}`, page_name: 'QR Scanner', data_changed: { time: new Date().toISOString() },
            user_name: `${scannedUser.first_name} ${scannedUser.last_name}`
          });
      } else {
          actionType = scannedUser.nextAction === 'check_out' ? 'school_check_out' : 'school_check_in';
          await supabase.from('system_logs').insert({
            user_id: scannedUser.user_id,
            action_type: actionType,
            activity: `Student ${actionLabel}`, page_name: 'QR Scanner', data_changed: { time: new Date().toISOString() },
            user_name: `${scannedUser.first_name} ${scannedUser.last_name}`
          });
      }"""

content = re.sub(target, replacement, content)

with open('src/pages/QRScanner.tsx', 'w') as f:
    f.write(content)
print("QR Scanner confirmAction patched successfully!")
