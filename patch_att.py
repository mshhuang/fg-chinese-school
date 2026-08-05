with open('src/pages/AttendanceSheet.tsx', 'r') as f:
    text = f.read()

text = text.replace('Clock In\n                                        </button>', '{t("Clock In")}\n                                        </button>')

with open('src/pages/AttendanceSheet.tsx', 'w') as f:
    f.write(text)
