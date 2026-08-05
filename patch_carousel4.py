with open('src/components/PhotoCarousel.tsx', 'r') as f:
    text = f.read()

text = text.replace('<Plus className="w-4 h-4" /> Post Photo', '<Plus className="w-4 h-4" /> {t("Post Photo")}')
text = text.replace('<Plus className="w-4 h-4" /> Post First Photo', '<Plus className="w-4 h-4" /> {t("Post First Photo")}')

with open('src/components/PhotoCarousel.tsx', 'w') as f:
    f.write(text)
