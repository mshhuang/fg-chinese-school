const fs = require('fs');
let code = fs.readFileSync('src/lib/photoService.ts', 'utf8');

const addTarget = `  // Update local storage sync immediately
  const current = await getPhotos();
  const updated = [newPhoto, ...current.filter(p => p.id !== newPhoto.id)].slice(0, 50);
  try {
    safeSetLocalStorage(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('photos_updated'));
  } catch (e) {
    console.error('Failed to save photo locally:', e);
  }

  // Attempt Supabase insert in background
  try {
    await supabase.from('class_photos').insert([{
      id: newPhoto.id,
      title: newPhoto.title,
      description: newPhoto.description,
      image_url: newPhoto.image_url,
      teacher_name: newPhoto.teacher_name,
      teacher_role: newPhoto.teacher_role,
      class_name: newPhoto.class_name,
      audience_type: newPhoto.audience_type || 'all',
      target_audience_label: newPhoto.target_audience_label || 'All Audience (Students & Parents)',
      created_at: newPhoto.created_at,
      reactions: JSON.stringify(newPhoto.reactions)
    }]);
  } catch (e) {
    console.log('Supabase insert note:', e);
  }

  return newPhoto;`;

const addReplace = `  // Attempt Supabase insert first
  const { error } = await supabase.from('class_photos').insert([{
    id: newPhoto.id,
    title: newPhoto.title,
    description: newPhoto.description,
    image_url: newPhoto.image_url,
    teacher_name: newPhoto.teacher_name,
    teacher_role: newPhoto.teacher_role,
    class_name: newPhoto.class_name,
    audience_type: newPhoto.audience_type || 'all',
    target_audience_label: newPhoto.target_audience_label || 'All Audience (Students & Parents)',
    created_at: newPhoto.created_at,
    reactions: JSON.stringify(newPhoto.reactions)
  }]);

  if (error) {
    throw new Error(error.message);
  }

  // Update local storage sync
  const current = await getPhotos();
  const updated = [newPhoto, ...current.filter(p => p.id !== newPhoto.id)].slice(0, 50);
  try {
    safeSetLocalStorage(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('photos_updated'));
  } catch (e) {
    console.error('Failed to save photo locally:', e);
  }

  return newPhoto;`;

const updateTarget = `  current[index] = updatedPhoto;
  try {
    safeSetLocalStorage(STORAGE_KEY, JSON.stringify(current));
    window.dispatchEvent(new Event('photos_updated'));
  } catch (e) {}

  try {
    await supabase.from('class_photos').update({
      title: updatedPhoto.title,
      description: updatedPhoto.description,
      image_url: updatedPhoto.image_url,
      class_name: updatedPhoto.class_name,
      audience_type: updatedPhoto.audience_type,
      target_audience_label: updatedPhoto.target_audience_label
    }).eq('id', photoId);
  } catch (e) {}

  return updatedPhoto;`;

const updateReplace = `  const { error } = await supabase.from('class_photos').update({
    title: updatedPhoto.title,
    description: updatedPhoto.description,
    image_url: updatedPhoto.image_url,
    class_name: updatedPhoto.class_name,
    audience_type: updatedPhoto.audience_type,
    target_audience_label: updatedPhoto.target_audience_label
  }).eq('id', photoId);

  if (error) {
    throw new Error(error.message);
  }

  current[index] = updatedPhoto;
  try {
    safeSetLocalStorage(STORAGE_KEY, JSON.stringify(current));
    window.dispatchEvent(new Event('photos_updated'));
  } catch (e) {}

  return updatedPhoto;`;

code = code.replace(addTarget, addReplace);
code = code.replace(updateTarget, updateReplace);

fs.writeFileSync('src/lib/photoService.ts', code);
