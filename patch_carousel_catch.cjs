const fs = require('fs');
let code = fs.readFileSync('src/components/PhotoCarousel.tsx', 'utf8');

const targetStr = `    if (editingPhotoId) {
      // Edit Existing Photo
      const updated = await updatePhoto(editingPhotoId, {
        title: title.trim(),
        description: description.trim(),
        image_url: finalImageUrl,
        class_name: classNameToUse,
        class_names: finalClasses,
        audience_type: audienceTarget,
        target_audience_label: targetAudienceLabel
      });

      if (updated) {
        setPhotos(prev => prev.map(p => p.id === editingPhotoId ? updated : p));
        if (lightboxPhoto?.id === editingPhotoId) {
          setLightboxPhoto(updated);
        }
      }
      showToast('Photo highlight updated successfully!');
    } else {
      // Add New Photo
      const created = await addPhoto({
        title: title.trim(),
        description: description.trim(),
        image_url: finalImageUrl,
        teacher_name: teacherName || 'Teacher',
        teacher_role: teacherRole,
        class_name: classNameToUse,
        class_names: finalClasses,
        audience_type: audienceTarget,
        target_audience_label: targetAudienceLabel
      });

      // setPhotos(prev => [created, ...prev]); handled by event
      setCurrentIndex(0);
      showToast('Photo highlight published successfully!');
    }

    setIsUploading(false);
    setShowUploadModal(false);
    setEditingPhotoId(null);`;

const newStr = `    try {
      if (editingPhotoId) {
        // Edit Existing Photo
        const updated = await updatePhoto(editingPhotoId, {
          title: title.trim(),
          description: description.trim(),
          image_url: finalImageUrl,
          class_name: classNameToUse,
          class_names: finalClasses,
          audience_type: audienceTarget,
          target_audience_label: targetAudienceLabel
        });

        if (updated) {
          setPhotos(prev => prev.map(p => p.id === editingPhotoId ? updated : p));
          if (lightboxPhoto?.id === editingPhotoId) {
            setLightboxPhoto(updated);
          }
        }
        showToast('Photo highlight updated successfully!');
      } else {
        // Add New Photo
        const created = await addPhoto({
          title: title.trim(),
          description: description.trim(),
          image_url: finalImageUrl,
          teacher_name: teacherName || 'Teacher',
          teacher_role: teacherRole,
          class_name: classNameToUse,
          class_names: finalClasses,
          audience_type: audienceTarget,
          target_audience_label: targetAudienceLabel
        });

        // setPhotos(prev => [created, ...prev]); handled by event
        setCurrentIndex(0);
        showToast('Photo highlight published successfully!');
      }

      setIsUploading(false);
      setShowUploadModal(false);
      setEditingPhotoId(null);
    } catch (err: any) {
      console.error("Database save failed:", err);
      alert("Database error: Could not save the photo highlight. " + err.message);
      setIsUploading(false);
    }`;

code = code.replace(targetStr, newStr);

fs.writeFileSync('src/components/PhotoCarousel.tsx', code);
