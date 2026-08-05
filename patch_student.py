with open('src/pages/StudentPortal.tsx', 'r') as f:
    text = f.read()

text = text.replace("Your journey of knowledge continues. You're doing great!</p>", '{t("Your journey of knowledge continues. You\'re doing great!")}</p>')
text = text.replace("Linked Family:</span>", '{t("Linked Family:")}</span>')

with open('src/pages/StudentPortal.tsx', 'w') as f:
    f.write(text)
