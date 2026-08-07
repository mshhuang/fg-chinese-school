with open('src/components/PhotoCarousel.tsx', 'r') as f:
    text = f.read()

text = text.replace('bg-surface-container-lowest group', 'bg-surface-variant group')
text = text.replace('<div className="md:w-2/3 bg-surface-container-lowest flex items-center justify-center min-h-[300px] max-h-[65vh] md:max-h-[80vh]">', '<div className="md:w-2/3 bg-surface-variant flex items-center justify-center min-h-[300px] max-h-[65vh] md:max-h-[80vh]">')
text = text.replace('bg-surface-container/90 backdrop-blur-md', 'bg-surface-variant/95 backdrop-blur-md')

with open('src/components/PhotoCarousel.tsx', 'w') as f:
    f.write(text)
