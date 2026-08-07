with open('src/components/PhotoCarousel.tsx', 'r') as f:
    text = f.read()

old_main = """                  {/* Photo Background */}
                  <img
                    src={currentPhoto.image_url}
                    alt={currentPhoto.title}
                    className="w-full h-full object-contain bg-black"
                  />"""

new_main = """                  {/* Photo Background */}
                  <div className="absolute inset-0 w-full h-full overflow-hidden">
                    <img
                      src={currentPhoto.image_url}
                      alt={currentPhoto.title}
                      className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-50 scale-110"
                    />
                  </div>
                  <img
                    src={currentPhoto.image_url}
                    alt={currentPhoto.title}
                    className="relative w-full h-full object-contain z-10"
                  />"""

text = text.replace(old_main, new_main)

with open('src/components/PhotoCarousel.tsx', 'w') as f:
    f.write(text)
