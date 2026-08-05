with open('src/components/PhotoCarousel.tsx', 'r') as f:
    text = f.read()

text = text.replace('No photo highlights match the selected class filter. Teachers can post classroom photos with target audience settings.', '{t("No photo highlights match the selected class filter. Teachers can post classroom photos with target audience settings.")}')

with open('src/components/PhotoCarousel.tsx', 'w') as f:
    f.write(text)
