import re

with open('src/pages/QRScanner.tsx', 'r') as f:
    content = f.read()

pattern = r"""          actionType = scannedUser\.nextAction === 'check_out' \? 'clock_out' : 'clock_in';\n          await supabase\.from\('staff_clock_ins'\)\.insert\(\{\n            user_id: scannedUser\.user_id,\n            action_type: actionType\n          \}\);"""
replacement = """          actionType = scannedUser.nextAction === 'check_out' ? 'clock_out' : 'clock_in';
          await supabase.from('staff_clock_ins').insert({
            user_id: scannedUser.user_id,
            action_type: actionType,
            daily_status: actionType === 'clock_out' ? 'classes over' : 'check-in the building'
          });"""

content = re.sub(pattern, replacement, content)

with open('src/pages/QRScanner.tsx', 'w') as f:
    f.write(content)
