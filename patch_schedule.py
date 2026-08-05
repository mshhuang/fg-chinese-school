with open('src/pages/StudentSchedule.tsx', 'r') as f:
    text = f.read()

text = text.replace("MY SCHEDULE", "{t('MY SCHEDULE')}")
text = text.replace("Open Full Calendar", "{t('Open Full Calendar')}")

with open('src/pages/StudentSchedule.tsx', 'w') as f:
    f.write(text)
