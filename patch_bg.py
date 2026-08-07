with open('src/components/PhotoCarousel.tsx', 'r') as f:
    text = f.read()

text = text.replace('bg-black group', 'bg-surface-container-lowest group')
text = text.replace('<div className="md:w-2/3 bg-black flex items-center justify-center min-h-[300px] max-h-[65vh] md:max-h-[80vh]">', '<div className="md:w-2/3 bg-surface-container-lowest flex items-center justify-center min-h-[300px] max-h-[65vh] md:max-h-[80vh]">')
text = text.replace('bg-black/90 backdrop-blur-md', 'bg-surface-container/90 backdrop-blur-md')
text = text.replace('bg-black/70 backdrop-blur-sm', 'bg-surface/80 backdrop-blur-sm')

with open('src/components/PhotoCarousel.tsx', 'w') as f:
    f.write(text)
