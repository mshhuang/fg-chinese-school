const fs = require('fs');
let code = fs.readFileSync('src/components/PhotoCarousel.tsx', 'utf8');

const targetStr = `    if (editingPhotoId) {
      // Edit Existing Photo
      const updated = await updatePhoto(editingPhotoId, {`;

const newStr = `    let finalImageUrl = imageUrl.trim();
    if (finalImageUrl.startsWith('data:image/')) {
        try {
            const response = await fetch(finalImageUrl);
            const blob = await response.blob();
            const ext = blob.type.split('/')[1] || 'jpg';
            const filePath = \`photo_\${Date.now()}_\${Math.random().toString(36).substring(2, 7)}.\${ext}\`;
            
            const { error: uploadError } = await supabase.storage
                .from('class_photos')
                .upload(filePath, blob, { cacheControl: '3600', upsert: false });
                
            if (!uploadError) {
                const { data } = supabase.storage.from('class_photos').getPublicUrl(filePath);
                finalImageUrl = data.publicUrl;
            } else {
                console.error("Storage upload failed:", uploadError);
                if (uploadError.statusCode === "404" || uploadError.statusCode === "400") { 
                     alert("Could not upload photo: Bucket 'class_photos' not found. Ensure it exists and is public.");
                     setIsUploading(false);
                     return;
                } else { 
                     alert("Could not upload photo: " + uploadError.message);
                     setIsUploading(false);
                     return;
                }
            }
        } catch (e) {
            console.error("Failed to upload image:", e);
            alert("Failed to upload the image.");
            setIsUploading(false);
            return;
        }
    }

    if (editingPhotoId) {
      // Edit Existing Photo
      const updated = await updatePhoto(editingPhotoId, {`;

code = code.replace(targetStr, newStr);

// Also need to replace imageUrl.trim() with finalImageUrl in updatePhoto and addPhoto
code = code.replace(/image_url: imageUrl\.trim\(\),/g, "image_url: finalImageUrl,");

fs.writeFileSync('src/components/PhotoCarousel.tsx', code);
