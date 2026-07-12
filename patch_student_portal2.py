import re

with open('src/pages/StudentPortal.tsx', 'r') as f:
    content = f.read()

content = content.replace('''     } else {
        setCheckInStatus('not_checked_in');
     }
     } else {
        setCheckInStatus('not_checked_in');
     }''', '''     } else {
        setCheckInStatus('not_checked_in');
     }''')

with open('src/pages/StudentPortal.tsx', 'w') as f:
    f.write(content)
