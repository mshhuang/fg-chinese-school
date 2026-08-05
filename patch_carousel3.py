with open('src/components/PhotoCarousel.tsx', 'r') as f:
    text = f.read()

text = text.replace('No Photo Highlights Found</h3>', '{t("No Photo Highlights Found")}</h3>')
text = text.replace('No photo highlights match the selected class filter. Teachers can post classroom photos with target audience settings.</p>', '{t("No photo highlights match the selected class filter. Teachers can post classroom photos with target audience settings.")}</p>')

with open('src/components/PhotoCarousel.tsx', 'w') as f:
    f.write(text)
