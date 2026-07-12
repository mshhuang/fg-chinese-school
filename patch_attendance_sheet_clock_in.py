import re

with open('src/pages/AttendanceSheet.tsx', 'r') as f:
    content = f.read()

# Add state for clockIns
if "const [clockIns, setClockIns] = useState" not in content:
    content = content.replace(
        "const [attendance, setAttendance] = useState<Record<string, string>>({});",
        "const [attendance, setAttendance] = useState<Record<string, string>>({});\n  const [clockIns, setClockIns] = useState<Record<string, boolean>>({});"
    )

with open('src/pages/AttendanceSheet.tsx', 'w') as f:
    f.write(content)
