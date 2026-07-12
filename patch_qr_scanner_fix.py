import re

with open('src/pages/QRScanner.tsx', 'r') as f:
    content = f.read()

# First, remove the entire auto-insertion block in handleScanSuccess.
# It starts at "      // Auto check-in/out logic" and ends right before "      setMessage({ type: 'success',"
pattern1 = r"      // Auto check-in/out logic.*?      // Update attendance table for students\n.*?      if \(isCheckIn\) \{\n(?:.*?\n){19}      \}\n"
# Actually, it's safer to do this with string search.

start_idx = content.find("      // Auto check-in/out logic")
end_idx = content.find("      setMessage({ type: 'success', text: `Successfully ${actionLabel}")

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + content[end_idx:]

# Next, we need to remove the setMessage inside handleScanSuccess so that the user can see the confirm UI.
# And we also shouldn't clear scannedUser right away.
# Let's replace the ending of handleScanSuccess.
pattern2 = r"      setMessage\(\{ type: 'success',.*?\n\s*// Auto-clear after 3 seconds\n\s*setTimeout\(\(\) => \{\n\s*setScanResult\(null\);\n\s*setMessage\(null\);\n\s*setScannedUser\(null\);\n\s*isProcessingRef\.current = false;\n\s*\}, 3000\);"
replacement2 = """      // Wait for user to confirm action.
      setLoading(false);
      return;"""

content = re.sub(pattern2, replacement2, content, flags=re.DOTALL)

# Next, let's fix handleOverride to ALSO record to staff/student clock_ins!
override_pattern = r"""      // Update attendance table for students\n      const isCheckInStatus = status === 'school_check_in' \|\| status === 'school_check_in_late' \|\| status === 'school_absent';"""
override_replacement = """      // Also add to clock ins
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
      const isCheckInStatus = status === 'school_check_in' || status === 'school_check_in_late' || status === 'school_absent';"""

content = content.replace("      // Update attendance table for students\n      const isCheckInStatus = status === 'school_check_in' || status === 'school_check_in_late' || status === 'school_absent';", override_replacement)


with open('src/pages/QRScanner.tsx', 'w') as f:
    f.write(content)
