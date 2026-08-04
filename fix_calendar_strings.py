import glob
import re

files = glob.glob('src/pages/*Calendar.tsx')
for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()
    
    content = re.sub(r'EVENTS', '{t("EVENTS")}', content)
    content = re.sub(r'Upcoming<br />schedule', '{t("Upcoming")}<br />{t("schedule")}', content)
    content = re.sub(r'>\s*No upcoming events\.\s*<', '> {t("No upcoming events.")} <', content)
    
    with open(filepath, 'w') as f:
        f.write(content)

print("Updated Calendar files")
