with open('src/components/PhotoCarousel.tsx', 'r') as f:
    text = f.read()

# Replace the main photo background
old_main = """                  {/* Photo Background */}
                  <img
                    src={currentPhoto.image_url}
                    alt={currentPhoto.title}
                    className="w-full h-full object-cover"
                  />"""

new_main = """                  {/* Photo Background */}
                  <img
                    src={currentPhoto.image_url}
                    alt={currentPhoto.title}
                    className="w-full h-full object-contain bg-black"
                  />"""

text = text.replace(old_main, new_main)

# Replace the preview image
old_preview = """                  {previewImage && (
                    <div className="mt-3 relative h-36 w-full rounded-2xl overflow-hidden border border-outline-variant/30 bg-black">
                      <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}"""

new_preview = """                  {previewImage && (
                    <div className="mt-3 relative h-36 w-full rounded-2xl overflow-hidden border border-outline-variant/30 bg-black">
                      <img src={previewImage} alt="Preview" className="w-full h-full object-contain" />
                    </div>
                  )}"""

text = text.replace(old_preview, new_preview)

with open('src/components/PhotoCarousel.tsx', 'w') as f:
    f.write(text)
