import re

with open('src/components/PhotoCarousel.tsx', 'r') as f:
    text = f.read()

# Add Download icon
text = text.replace('  Check\n}', '  Check,\n  Download\n}')
text = text.replace('  Check,\n}', '  Check,\n  Download\n}')

# Add handleDownload function
func_code = """
  const handleDownload = async (e: React.MouseEvent, url: string, title: string) => {
    e.stopPropagation();
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = (title ? title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'photo') + '.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed, opening in new tab', error);
      window.open(url, '_blank');
    }
  };

  const nextSlide = () => {"""

text = text.replace("""  const nextSlide = () => {""", func_code)

# Add button in main carousel
main_button = """                      {/* Fullscreen Lightbox Button */}
                      <button
                        onClick={(e) => handleDownload(e, currentPhoto.image_url, currentPhoto.title)}
                        className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black transition-all border border-white/20"
                        title="Download Photo"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setLightboxPhoto(currentPhoto)}"""

text = text.replace("""                      {/* Fullscreen Lightbox Button */}
                      <button
                        onClick={() => setLightboxPhoto(currentPhoto)}""", main_button)

# Add button in lightbox
lightbox_button = """              <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
                <button
                  onClick={(e) => handleDownload(e, lightboxPhoto.image_url, lightboxPhoto.title)}
                  className="p-2.5 rounded-full bg-black/60 text-white hover:bg-black transition-colors border border-white/20"
                  title="Download Photo"
                >
                  <Download className="w-5 h-5" />
                </button>
                {showTeacherUpload && ("""

text = text.replace("""              <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
                {showTeacherUpload && (""", lightbox_button)

with open('src/components/PhotoCarousel.tsx', 'w') as f:
    f.write(text)
