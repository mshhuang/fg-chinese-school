import re

with open('src/pages/AttendanceSheet.tsx', 'r') as f:
    content = f.read()

replacement = """       // fetch today's clock in status
       const [year, month, day] = targetDate.split('-').map(Number);
       const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
       const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);"""

content = content.replace(
"""       // fetch today's clock in status
       const startOfDay = new Date(targetDate);
       startOfDay.setHours(0,0,0,0);
       const endOfDay = new Date(targetDate);
       endOfDay.setHours(23,59,59,999);""", replacement)

with open('src/pages/AttendanceSheet.tsx', 'w') as f:
    f.write(content)
