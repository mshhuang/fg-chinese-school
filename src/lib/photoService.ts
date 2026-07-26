import { supabase } from './supabase';

export interface ClassPhotoItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  teacher_id?: string;
  teacher_name: string;
  teacher_role?: string;
  class_name?: string;
  class_names?: string[];
  audience_type?: 'all' | 'class' | 'parents' | 'students';
  target_audience_label?: string;
  created_at: string;
  likes_count?: number;
  reactions?: Record<string, number>;
}

export const SCHOOL_CLASSES = [
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus & Neptune'
];

const DEFAULT_PHOTOS: ClassPhotoItem[] = [];

const STORAGE_KEY = 'school_class_photos_v3';

function safeSetLocalStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    console.warn(`Failed to set localStorage for key ${key}:`, err);
  }
}

function safeGetLocalStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (err) {
    console.warn(`Failed to get localStorage for key ${key}:`, err);
    return null;
  }
}

export async function getPhotos(roleFilter?: 'student' | 'parent' | 'teacher' | 'admin' | 'staff' | 'all' | string, selectedClassFilter?: string): Promise<ClassPhotoItem[]> {
  let photos: ClassPhotoItem[] = [];

  // Read local storage cache first to ensure immediate offline/deleted consistency
  try {
    const localData = safeGetLocalStorage(STORAGE_KEY);
    if (localData) {
      const parsed = JSON.parse(localData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        photos = parsed.filter(p => p.image_url);
      }
    }
  } catch (e) {}

  // If local storage is empty, initialize with default photos
  if (photos.length === 0) {
    photos = DEFAULT_PHOTOS;
    try {
      safeSetLocalStorage(STORAGE_KEY, JSON.stringify(DEFAULT_PHOTOS));
    } catch (e) {}
  }

  // Try fetching from Supabase 'class_photos' if table exists and sync new rows
  try {
    const { data, error } = await supabase
      .from('class_photos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data && data.length > 0) {
      const remotePhotos: ClassPhotoItem[] = data.map((item: any) => ({
        id: item.id || item.photo_id,
        title: item.title,
        description: item.description,
        image_url: item.image_url,
        teacher_id: item.teacher_id,
        teacher_name: item.teacher_name,
        teacher_role: item.teacher_role,
        class_name: item.class_name,
        audience_type: item.audience_type || 'all',
        target_audience_label: item.target_audience_label || 'All Audience (Students & Parents)',
        created_at: item.created_at,
        likes_count: item.likes_count || 0,
        reactions: typeof item.reactions === 'string' ? JSON.parse(item.reactions) : (item.reactions || { '❤️': 0, '👏': 0, '⭐': 0 })
      }));

      // Merge remote photos into local list without resurrecting deleted items
      const localIds = new Set(photos.map(p => p.id));
      let deletedIdsArray = [];
      try {
        const deletedStr = safeGetLocalStorage('deleted_photo_ids');
        if (deletedStr) deletedIdsArray = JSON.parse(deletedStr);
      } catch (e) {
        console.warn("Could not parse deleted_photo_ids", e);
      }
      const deletedIds = new Set(deletedIdsArray);
      
      const mergedPhotos = [...remotePhotos.filter(rp => !deletedIds.has(rp.id))];
      const remoteIds = new Set(mergedPhotos.map(p => p.id));
      
      // Keep local photos that haven't synced to remote yet
      photos.forEach(lp => {
        if (!remoteIds.has(lp.id) && !deletedIds.has(lp.id)) {
          mergedPhotos.push(lp);
        }
      });
      
      photos = mergedPhotos.slice(0, 50);
    }
  } catch (e) {
    // Supabase optional fallback
  }

  // Apply role/audience filtering
  if (roleFilter === 'student') {
    photos = photos.filter(p => !p.audience_type || p.audience_type === 'all' || p.audience_type === 'students' || p.audience_type === 'class');
  } else if (roleFilter === 'parent') {
    photos = photos.filter(p => !p.audience_type || p.audience_type === 'all' || p.audience_type === 'parents' || p.audience_type === 'class');
  }

  // Apply class filtering if selected
  if (selectedClassFilter && selectedClassFilter !== 'all' && selectedClassFilter !== 'all_unfiltered') {
    photos = photos.filter(p => {
      if (p.audience_type === 'all' || p.class_name === 'School-Wide') return true;
      if (p.class_names && Array.isArray(p.class_names) && p.class_names.includes(selectedClassFilter)) return true;
      if (p.class_name) {
        const parts = p.class_name.split(',').map(s => s.trim());
        if (parts.includes(selectedClassFilter)) return true;
      }
      return false;
    });
  }

  // Deduplicate items by ID
  const seenIds = new Set<string>();
  const uniquePhotos: ClassPhotoItem[] = [];
  for (const p of photos) {
    if (p.id && !seenIds.has(p.id)) {
      seenIds.add(p.id);
      uniquePhotos.push(p);
    }
  }

  return uniquePhotos.slice(0, 50);
}

export async function addPhoto(photo: Omit<ClassPhotoItem, 'id' | 'created_at' | 'likes_count' | 'reactions'>): Promise<ClassPhotoItem> {
  const newPhoto: ClassPhotoItem = {
    ...photo,
    id: 'photo-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    created_at: new Date().toISOString(),
    likes_count: 0,
    reactions: { '❤️': 0, '👏': 0, '⭐': 0 }
  };
  

  // Update local storage sync immediately
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

  return newPhoto;
}

export async function updatePhoto(photoId: string, updates: Partial<ClassPhotoItem>): Promise<ClassPhotoItem | null> {
  const current = await getPhotos();
  const index = current.findIndex(p => p.id === photoId);
  if (index === -1) return null;

  const photo = current[index];
  const updatedPhoto: ClassPhotoItem = {
    ...photo,
    ...updates,
  };

  current[index] = updatedPhoto;
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

  return updatedPhoto;
}

export async function deletePhoto(id: string): Promise<boolean> {
  // Track deleted IDs in localStorage so remote sync does not resurrect deleted items
  try {
    let deletedIdsArray = [];
    try {
      const deletedStr = safeGetLocalStorage('deleted_photo_ids');
      if (deletedStr) deletedIdsArray = JSON.parse(deletedStr);
    } catch (e) {
      console.warn("Could not parse deleted_photo_ids", e);
    }
    const deletedIds = new Set(deletedIdsArray);
    deletedIds.add(id);
    safeSetLocalStorage('deleted_photo_ids', JSON.stringify(Array.from(deletedIds)));

    const localData = safeGetLocalStorage(STORAGE_KEY);
    let current: ClassPhotoItem[] = [];
    if (localData) {
      current = JSON.parse(localData);
    } else {
      current = DEFAULT_PHOTOS;
    }
    const updated = current.filter(p => p.id !== id);
    safeSetLocalStorage(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('photos_updated'));
  } catch (e) {
    console.error('Error removing photo locally:', e);
  }

  // Attempt Supabase deletion in background
  try {
    await supabase.from('class_photos').delete().eq('id', id);
  } catch (e) {}

  return true;
}

export async function addReaction(photoId: string, reactionType: string): Promise<ClassPhotoItem | null> {
  const current = await getPhotos();
  const index = current.findIndex(p => p.id === photoId);
  if (index === -1) return null;

  const photo = current[index];
  const reactions = { ...(photo.reactions || { '❤️': 0, '👏': 0, '⭐': 0 }) };
  reactions[reactionType] = (reactions[reactionType] || 0) + 1;

  const updatedPhoto: ClassPhotoItem = {
    ...photo,
    reactions,
    likes_count: (photo.likes_count || 0) + 1
  };

  current[index] = updatedPhoto;
  try {
    safeSetLocalStorage(STORAGE_KEY, JSON.stringify(current));
    window.dispatchEvent(new Event('photos_updated'));
  } catch (e) {}

  try {
    await supabase.from('class_photos').update({
      reactions: JSON.stringify(reactions),
      likes_count: updatedPhoto.likes_count
    }).eq('id', photoId);
  } catch (e) {}

  return updatedPhoto;
}
