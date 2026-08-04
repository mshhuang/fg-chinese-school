import React, {  useState, useEffect  } from 'react';
import { useLanguage } from '../lib/i18n';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Maximize2,
  X,
  Upload,
  Plus,
  Sparkles,
  BookOpen,
  Trash2,
  Edit3,
  MessageSquare,
  Users,
  ImageIcon,
  User,
  Calendar,
  Filter,
  CheckCircle2,
  School,
  AlertTriangle,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  FileText,
  Check
} from 'lucide-react';
import {
  ClassPhotoItem,
  getPhotos,
  addPhoto,
  updatePhoto,
  deletePhoto,
  addReaction,
  SCHOOL_CLASSES
} from '../lib/photoService';
import { supabase } from '../lib/supabase';
import { cn, formatTeacherName } from '../lib/utils';

interface PhotoCarouselProps {
  className?: string;
  showTeacherUpload?: boolean;
  currentUser?: any;
  viewerRole?: 'student' | 'parent' | 'teacher' | 'all';
  compact?: boolean;
}

export function PhotoCarousel({
  className,
  showTeacherUpload = false,
  currentUser,
  viewerRole = 'all',
  compact = false
}: PhotoCarouselProps) {
  const { t } = useLanguage();
  const [photos, setPhotos] = useState<ClassPhotoItem[]>([]);
  const [allRolePhotos, setAllRolePhotos] = useState<ClassPhotoItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<ClassPhotoItem | null>(null);
  
  // Option to toggle caption overlay on top of the image (defaults to false so photo is clean & unobstructed)
  const [showOverlayText, setShowOverlayText] = useState(false);
  
  // Class filter state
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [dbClasses, setDbClasses] = useState<string[]>([]);

  // Custom Delete Confirmation Modal state (no window.confirm!)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Upload/Edit modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Target Audience selection: 'all' (All Audience - Students & Parents) vs 'class' (Specific Classes)
  const [audienceTarget, setAudienceTarget] = useState<'all' | 'class'>('all');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([SCHOOL_CLASSES[0]]);
  const [customClass, setCustomClass] = useState('');
  const [useCustomClass, setUseCustomClass] = useState(false);

  const [imageUrl, setImageUrl] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Preset quick images for teacher quick pick
  const PRESET_IMAGES: { label: string; url: string }[] = [];

  const showToast = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

        const loadPhotos = async () => {
    let roleAll = await getPhotos(viewerRole, 'all_unfiltered');
    let data = await getPhotos(viewerRole, selectedClassFilter);
    
    // Additional filtering for teachers
    if (viewerRole === 'teacher' && currentUser) {
        try {
            const currentUserId = currentUser.id || currentUser.user_id;
            const realUserId = currentUserId?.startsWith('user_') ? currentUserId.replace('user_', '') : currentUserId;
            
            // Fetch all classes and filter locally to avoid Supabase array syntax issues
            const { data: clsData } = await supabase.from('classes').select('class_name, primary_teacher_id, co_teacher_id, co_teachers');
                
            if (clsData) {
                const teacherClasses = clsData.filter((c: any) => {
                    if (c.primary_teacher_id === realUserId || c.co_teacher_id === realUserId) return true;
                    if (c.co_teachers && Array.isArray(c.co_teachers) && c.co_teachers.includes(realUserId)) return true;
                    return false;
                });
                const teacherClassNames = teacherClasses.map((c: any) => c.class_name);
                
                const filterTeacherPhotos = (photos: any[]) => {
                    return photos.filter(p => {
                        if (p.audience_type === 'all') return true;
                        
                        // Check if photo belongs to teacher's classes
                        if (p.class_names && Array.isArray(p.class_names)) {
                            if (p.class_names.some((cn: string) => teacherClassNames.includes(cn))) return true;
                        }
                        if (p.class_name) {
                            const parts = p.class_name.split(',').map((s: string) => s.trim());
                            if (parts.some((cn: string) => teacherClassNames.includes(cn))) return true;
                        }
                        
                        return false;
                    });
                };
                
                roleAll = filterTeacherPhotos(roleAll);
                data = filterTeacherPhotos(data);
            }

        } catch (e) {
            console.error("Error filtering teacher classes", e);
        }
    }
    
    setAllRolePhotos(roleAll);
    setPhotos(data);
    if (data.length > 0 && currentIndex >= data.length) {
      setCurrentIndex(0);
    }
  };

  useEffect(() => {
        async function fetchClasses() {
      try {
        const { data } = await supabase.from('classes').select('class_name, primary_teacher_id, co_teacher_id, co_teachers');
        if (data) {
          let filteredClasses = data;
          if (viewerRole === 'teacher' && currentUser) {
              const currentUserId = currentUser.id || currentUser.user_id;
              const realUserId = currentUserId?.startsWith('user_') ? currentUserId.replace('user_', '') : currentUserId;
              
              filteredClasses = data.filter((c: any) => {
                  if (c.primary_teacher_id === realUserId || c.co_teacher_id === realUserId) return true;
                  if (c.co_teachers && Array.isArray(c.co_teachers) && c.co_teachers.includes(realUserId)) return true;
                  return false;
              });
          }
          const names = filteredClasses.map((c: any) => c.class_name).filter(Boolean);
          setDbClasses(names);
        }
      } catch (e) {}
    }
    fetchClasses();
    loadPhotos();
    const handleUpdate = () => loadPhotos();
    window.addEventListener('photos_updated', handleUpdate);
    return () => window.removeEventListener('photos_updated', handleUpdate);
  }, [viewerRole, selectedClassFilter, currentUser]);

  // Rotate timer (5s interval)
  useEffect(() => {
    if (!isPlaying || isHovered || photos.length <= 1 || confirmDeleteId || showUploadModal) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % photos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, isHovered, photos.length, confirmDeleteId, showUploadModal]);

  const nextSlide = () => {
    if (photos.length === 0) return;
    setCurrentIndex((currentIndex + 1) % photos.length);
  };

  const prevSlide = () => {
    if (photos.length === 0) return;
    setCurrentIndex((currentIndex - 1 + photos.length) % photos.length);
  };

  const toggleClassSelection = (clsName: string) => {
    setSelectedClasses(prev => {
      if (prev.includes(clsName)) {
        if (prev.length === 1 && !useCustomClass) return prev;
        return prev.filter(c => c !== clsName);
      } else {
        return [...prev, clsName];
      }
    });
  };

  const selectAllClasses = () => {
    const allCls = viewerRole === "teacher" ? dbClasses : Array.from(new Set([...SCHOOL_CLASSES, ...dbClasses]));
    setSelectedClasses(allCls);
  };

  const openNewPhotoModal = () => {
    setEditingPhotoId(null);
    setTitle('');
    setDescription('');
    setImageUrl('');
    setPreviewImage(null);
    setAudienceTarget('all');
    setSelectedClasses([SCHOOL_CLASSES[0]]);
    setCustomClass('');
    setUseCustomClass(false);
    setShowUploadModal(true);
  };

  const openEditPhotoModal = (e: React.MouseEvent, photo: ClassPhotoItem) => {
    e.stopPropagation();
    setEditingPhotoId(photo.id);
    setTitle(photo.title || '');
    setDescription(photo.description || '');
    setImageUrl(photo.image_url);
    setPreviewImage(photo.image_url);
    
    if (photo.audience_type === 'class') {
      setAudienceTarget('class');
      const existingClasses = photo.class_names && photo.class_names.length > 0
        ? photo.class_names
        : (photo.class_name ? photo.class_name.split(',').map(s => s.trim()).filter(Boolean) : (viewerRole === "teacher" && dbClasses.length > 0 ? [dbClasses[0]] : [SCHOOL_CLASSES[0]]));
      
      setSelectedClasses(existingClasses);

      const predefined = new Set(viewerRole === "teacher" ? dbClasses : [...SCHOOL_CLASSES, ...dbClasses]);
      const customItems = existingClasses.filter(c => !predefined.has(c));
      if (customItems.length > 0) {
        setCustomClass(customItems.join(', '));
        setUseCustomClass(true);
      } else {
        setCustomClass('');
        setUseCustomClass(false);
      }
    } else {
      setAudienceTarget('all');
      setSelectedClasses([SCHOOL_CLASSES[0]]);
    }

    setShowUploadModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const originalFile = e.target.files?.[0];
    if (originalFile) {
      if (originalFile.size > 10 * 1024 * 1024) {
        showToast("Photo exceeds 10MB size limit.");
        return;
      }
      
      let file = originalFile;
      
      if (file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic') {
        setIsUploading(true);
        showToast("Converting iPhone photo to JPEG, please wait...");
        try {
          const heic2any = (await import('heic2any')).default;
          const convertedBlob = await heic2any({
            blob: file,
            toType: "image/jpeg",
            quality: 0.7
          });
          const convertedBlobFinal = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
          file = new File([convertedBlobFinal], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' });
        } catch (err) {
          console.error("HEIC conversion failed:", err);
          showToast("Failed to convert iPhone photo.");
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setPreviewImage(compressedBase64);
          setImageUrl(compressedBase64);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      alert('Please provide or upload a photo.');
      return;
    }

    setIsUploading(true);
    const teacherName = currentUser
      ? formatTeacherName(currentUser.first_name, currentUser.last_name, 'Teacher')
      : 'Classroom Teacher';
    const teacherRole = currentUser?.role || 'Teacher';

    let finalClasses: string[] = [];
    if (audienceTarget === 'class') {
      finalClasses = [...selectedClasses];
      if (useCustomClass && customClass.trim()) {
        const customItems = customClass.split(',').map(s => s.trim()).filter(Boolean);
        customItems.forEach(c => {
          if (!finalClasses.includes(c)) {
            finalClasses.push(c);
          }
        });
      }

      if (finalClasses.length === 0) {
        alert('Please select at least one class or enter a custom class name.');
        setIsUploading(false);
        return;
      }
    }

    const classNameToUse = audienceTarget === 'class'
      ? finalClasses.join(', ')
      : 'School-Wide';

    const targetAudienceLabel = audienceTarget === 'all'
      ? 'All Audience (Students & Parents)'
      : `Classes: ${classNameToUse} (Students & Parents)`;

    let finalImageUrl = imageUrl.trim();
    if (finalImageUrl.startsWith('data:image/')) {
        try {
            const response = await fetch(finalImageUrl);
            const blob = await response.blob();
            const ext = blob.type.split('/')[1] || 'jpg';
            const filePath = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
            
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

    try {
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
    }
  };

  const handleReactionClick = async (e: React.MouseEvent, photoId: string, emoji: string) => {
    e.stopPropagation();
    const updated = await addReaction(photoId, emoji);
    if (updated) {
      setPhotos(prev => prev.map(p => p.id === photoId ? updated : p));
      if (lightboxPhoto?.id === photoId) {
        setLightboxPhoto(updated);
      }
    }
  };

  const promptDeleteConfirmation = (e: React.MouseEvent, photoId: string) => {
    e.stopPropagation();
    setConfirmDeleteId(photoId);
  };

  const executeDeletePhoto = async () => {
    if (!confirmDeleteId) return;

    const idToDelete = confirmDeleteId;
    setConfirmDeleteId(null);

    // Instant state removal
    setPhotos(prev => {
      const next = prev.filter(p => p.id !== idToDelete);
      if (currentIndex >= next.length && next.length > 0) {
        setCurrentIndex(next.length - 1);
      } else if (next.length === 0) {
        setCurrentIndex(0);
      }
      return next;
    });

    if (lightboxPhoto?.id === idToDelete) {
      setLightboxPhoto(null);
    }

    await deletePhoto(idToDelete);
    showToast('Photo highlight removed.');
  };

  const currentPhoto = photos[currentIndex] || photos[0];

  // Derive unique class names available in photos for students/parents
  const availableClassesInRolePhotos = Array.from(
    new Set(
      allRolePhotos.flatMap(p => {
        if (p.class_names && Array.isArray(p.class_names) && p.class_names.length > 0) {
          return p.class_names;
        }
        if (p.class_name) {
          return p.class_name.split(',').map(s => s.trim());
        }
        return [];
      })
    )
  ).filter(c => c && c !== 'School-Wide');

  const isStudentOrParent = viewerRole === 'student' || viewerRole === 'parent' || !showTeacherUpload;

  const filterClassOptions = isStudentOrParent
    ? availableClassesInRolePhotos
    : Array.from(new Set(viewerRole === "teacher" ? [...dbClasses, ...availableClassesInRolePhotos] : [...SCHOOL_CLASSES, ...dbClasses, ...availableClassesInRolePhotos])).filter(c => c !== 'School-Wide');

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Toast Notification */}
      <AnimatePresence>
        {notificationMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-6 right-6 z-50 bg-primary text-on-primary px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-bold"
          >
            <CheckCircle2 className="w-4 h-4" />
            {notificationMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar with Class Filter & Upload Action */}
      <div className="flex flex-wrap justify-between items-center gap-3 px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-title text-lg font-bold text-on-surface flex items-center gap-2">
              {t("Classroom Photo Highlights")}
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-label font-bold">
                {t("Rotating Carousel")}
              </span>
            </h2>
            <p className="text-xs text-on-surface-variant">
              {t("Classroom activities, student projects & more")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Class Filter Selector */}
          <div className="flex items-center gap-1.5 bg-surface-container px-3 py-1.5 rounded-full border border-outline-variant/30 text-xs font-bold text-on-surface">
            <Filter className="w-3.5 h-3.5 text-primary" />
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-xs text-on-surface cursor-pointer pr-1"
            >
              <option value="all">{t("All Classes & Audience")}</option>
              {filterClassOptions.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          {/* Rotation Toggle */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? "Pause Rotation" : "Start Rotation"}
            className="p-2 rounded-full bg-surface-container hover:bg-surface-variant text-on-surface-variant transition-colors border border-outline-variant/30"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Teacher Upload Button */}
          {showTeacherUpload && (
            <button
              onClick={openNewPhotoModal}
              className="px-4 py-2 rounded-full bg-primary text-on-primary font-label font-bold text-xs flex items-center gap-1.5 shadow-sm hover:opacity-95 transition-all"
            >
              <Plus className="w-4 h-4" /> Post Photo
            </button>
          )}
        </div>
      </div>

      {/* Main Carousel Display */}
      {photos.length === 0 ? (
        <div className="p-10 rounded-3xl bg-surface-container border border-outline-variant/30 text-center flex flex-col items-center justify-center gap-3">
          <ImageIcon className="w-12 h-12 text-on-surface-variant/40" />
          <h3 className="font-title text-lg font-bold text-on-surface">No Photo Highlights Found</h3>
          <p className="text-xs text-on-surface-variant max-w-md">
            No photo highlights match the selected class filter. Teachers can post classroom photos with target audience settings.
          </p>
          {showTeacherUpload && (
            <button
              onClick={openNewPhotoModal}
              className="mt-2 px-5 py-2.5 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" /> Post First Photo
            </button>
          )}
        </div>
      ) : (
        <div
          className="relative w-full rounded-3xl overflow-hidden shadow-lg border border-outline-variant/30 bg-black group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative w-full h-[380px] sm:h-[440px] md:h-[480px]">
            <AnimatePresence mode="wait">
              {currentPhoto && (
                <motion.div
                  key={currentPhoto.id}
                  initial={{ opacity: 0, scale: 1.01 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.99 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="absolute inset-0 w-full h-full"
                >
                  {/* Photo Background */}
                  <img
                    src={currentPhoto.image_url}
                    alt={currentPhoto.title}
                    className="w-full h-full object-cover"
                  />

                  {/* Soft Gradient Overlay (Lightened so photo is clear) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50 pointer-events-none" />

                  {/* Top Overlay Badges & Actions */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Class Badge */}
                      <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white text-xs font-bold flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-primary-container" />
                        {currentPhoto.class_name || 'Classroom Story'}
                      </span>

                      {/* Target Audience Badge */}
                      <span className="px-3 py-1 rounded-full bg-primary/90 backdrop-blur-md text-on-primary text-xs font-bold flex items-center gap-1 shadow-sm">
                        <Users className="w-3.5 h-3.5" />
                        Target: {currentPhoto.target_audience_label || (currentPhoto.audience_type === 'all' ? 'All Audience (Students & Parents)' : 'Class (Students & Parents)')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 z-30">
                      {/* Toggle Overlay Caption Button (Only if description exists) */}
                      {Boolean(currentPhoto.description?.trim()) && (
                        <button
                          onClick={() => setShowOverlayText(!showOverlayText)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 backdrop-blur-md border border-white/20",
                            showOverlayText
                              ? "bg-primary text-on-primary shadow-md"
                              : "bg-black/60 text-white hover:bg-black"
                          )}
                          title={showOverlayText ? "Hide Overlay Text Box (Clean Photo View)" : "Overlay Text Box on Photo"}
                        >
                          {showOverlayText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span className="hidden sm:inline">{showOverlayText ? "Hide Caption Overlay" : "Overlay Caption"}</span>
                        </button>
                      )}

                      {/* Fullscreen Lightbox Button */}
                      <button
                        onClick={() => setLightboxPhoto(currentPhoto)}
                        className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black transition-all border border-white/20"
                        title="Expand Lightbox"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>

                      {/* Edit Button */}
                      {showTeacherUpload && (
                        <button
                          onClick={(e) => openEditPhotoModal(e, currentPhoto)}
                          className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-primary transition-all border border-white/20 hover:border-primary"
                          title="Edit Photo Details"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}

                      {/* Delete Button */}
                      {showTeacherUpload && (
                        <button
                          onClick={(e) => promptDeleteConfirmation(e, currentPhoto.id)}
                          className="p-2 rounded-full bg-red-950/80 backdrop-blur-md text-red-200 hover:bg-red-800 transition-all border border-red-500/40 hover:scale-105"
                          title="Delete Photo Highlight"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bottom Overlay Text Box (Title & Description if toggled) */}
                  <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 z-20 flex flex-col gap-2">
                    {/* Headline (Optional) */}
                    {Boolean(currentPhoto.title?.trim()) && (
                      <h3 className="text-xl sm:text-2xl font-title font-bold text-white tracking-tight drop-shadow">
                        {currentPhoto.title}
                      </h3>
                    )}

                    {/* If Explanation exists & Overlay Text is toggled on */}
                    {Boolean(currentPhoto.description?.trim()) && (
                      <AnimatePresence>
                        {showOverlayText ? (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="flex flex-col gap-2 max-w-3xl"
                          >
                            <div className="bg-black/75 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 text-white text-xs sm:text-sm font-body leading-relaxed shadow-xl">
                              <div className="flex items-start gap-2">
                                <MessageSquare className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                <p>{currentPhoto.description}</p>
                              </div>
                            </div>
                          </motion.div>
                        ) : (
                          /* Minimal Read Overlay pill */
                          <div className="flex justify-end">
                            <button
                              onClick={() => setShowOverlayText(true)}
                              className="px-3 py-1 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                            >
                              <FileText className="w-3.5 h-3.5 text-primary-container" />
                              <span>Read Caption</span>
                            </button>
                          </div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Arrows */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black transition-all border border-white/20 z-30 shadow-md hover:scale-105"
                  aria-label="Previous Photo"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={nextSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black transition-all border border-white/20 z-30 shadow-md hover:scale-105"
                  aria-label="Next Photo"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Pagination Strip */}
          {photos.length > 0 && (
            <div className="bg-surface-container-dark p-3 flex items-center justify-center gap-2 overflow-x-auto hide-scrollbar z-20 border-t border-white/10">
              {photos.map((p, idx) => (
                <button
                  key={`${p.id}-${idx}`}
                  onClick={() => setCurrentIndex(idx)}
                  className={cn(
                    "relative h-12 w-20 rounded-xl overflow-hidden shrink-0 transition-all border-2",
                    idx === currentIndex
                      ? "border-primary ring-2 ring-primary/40 scale-105"
                      : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  <img src={p.image_url} alt={p.title || 'Photo'} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Photo Details & Info Card Below Carousel */}
      {currentPhoto && photos.length > 0 && (
        <div className="mt-3 p-5 rounded-3xl bg-surface-container border border-outline-variant/30 shadow-sm flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/20 pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary shrink-0" />
              <h4 className="font-title font-bold text-base text-on-surface">
                {t("Photo Information")}
              </h4>
            </div>
            <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
              <span className="flex items-center gap-1 font-semibold text-on-surface">
                <User className="w-3.5 h-3.5 text-primary" />
                {formatTeacherName(currentPhoto.teacher_name)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(currentPhoto.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {(Boolean(currentPhoto.title?.trim()) || Boolean(currentPhoto.description?.trim())) && (
            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 text-on-surface text-sm font-body leading-relaxed">
              {Boolean(currentPhoto.title?.trim()) && (
                <p className="font-bold text-on-surface font-title text-base mb-1">
                  {currentPhoto.title}
                </p>
              )}
              {Boolean(currentPhoto.description?.trim()) && (
                <p className="text-on-surface-variant whitespace-pre-line leading-relaxed">
                  {currentPhoto.description}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
            onClick={() => setLightboxPhoto(null)}
          >
            <div
              className="relative max-w-5xl w-full bg-surface-container-lowest rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
                {showTeacherUpload && (
                  <button
                    onClick={(e) => {
                      setLightboxPhoto(null);
                      openEditPhotoModal(e, lightboxPhoto);
                    }}
                    className="p-2.5 rounded-full bg-black/60 text-white hover:bg-primary transition-colors border border-white/20"
                    title="Edit Photo"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                )}

                {showTeacherUpload && (
                  <button
                    onClick={(e) => {
                      setLightboxPhoto(null);
                      promptDeleteConfirmation(e, lightboxPhoto.id);
                    }}
                    className="p-2.5 rounded-full bg-red-900/80 text-white hover:bg-red-800 transition-colors border border-red-500/30"
                    title="Delete Photo"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}

                <button
                  onClick={() => setLightboxPhoto(null)}
                  className="p-2.5 rounded-full bg-black/60 text-white hover:bg-black transition-colors border border-white/20"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="md:w-2/3 bg-black flex items-center justify-center min-h-[300px] max-h-[65vh] md:max-h-[80vh]">
                <img
                  src={lightboxPhoto.image_url}
                  alt={lightboxPhoto.title}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="md:w-1/3 p-6 flex flex-col justify-between overflow-y-auto bg-surface">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="self-start px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs">
                      {lightboxPhoto.class_name || 'Classroom Story'}
                    </span>
                    <span className="self-start px-3 py-1 rounded-full bg-secondary/10 text-secondary font-bold text-xs flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {lightboxPhoto.target_audience_label || 'Students & Parents'}
                    </span>
                  </div>

                  {Boolean(lightboxPhoto.title?.trim()) && (
                    <h3 className="font-title text-xl font-bold text-on-surface">
                      {lightboxPhoto.title}
                    </h3>
                  )}

                  {Boolean(lightboxPhoto.description?.trim()) && (
                    <div className="bg-surface-container p-4 rounded-2xl border border-outline-variant/30 text-on-surface text-sm leading-relaxed">
                      <p className="font-semibold text-xs text-primary mb-1 uppercase tracking-wider">Teacher's Explanation</p>
                      <p>{lightboxPhoto.description}</p>
                    </div>
                  )}

                  <div className="text-xs text-on-surface-variant flex flex-col gap-1 pt-2">
                    <p><strong>Teacher:</strong> {formatTeacherName(lightboxPhoto.teacher_name)}</p>
                    <p><strong>Posted:</strong> {new Date(lightboxPhoto.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CUSTOM IN-APP DELETE CONFIRMATION DIALOG (Fixes window.confirm iframe bug) */}
      <AnimatePresence>
        {confirmDeleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setConfirmDeleteId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface-container-lowest max-w-md w-full rounded-3xl p-6 shadow-2xl border border-outline-variant/30 flex flex-col gap-4 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-title text-lg font-bold text-on-surface">Delete Photo Highlight?</h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  Are you sure you want to remove this photo from the classroom carousel? This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 py-2.5 rounded-full bg-surface-variant text-on-surface-variant font-bold text-xs hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDeletePhoto}
                  className="flex-1 py-2.5 rounded-full bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-colors shadow-md"
                >
                  Yes, Delete Photo
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Teacher Post / Edit Photo Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-container-lowest w-full max-w-xl rounded-3xl shadow-2xl p-6 flex flex-col gap-5 border border-outline-variant/20 my-8"
            >
              <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
                <h2 className="font-title text-xl font-bold text-on-surface flex items-center gap-2">
                  {editingPhotoId ? <Edit3 className="w-5 h-5 text-primary" /> : <Upload className="w-5 h-5 text-primary" />}
                  {editingPhotoId ? t("Edit Photo Highlight") : t("Post Photo")}
                </h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 rounded-full text-on-surface-variant hover:bg-surface-variant transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
                {/* Photo Headline Title */}
                <div>
                  <label className="block font-label text-xs uppercase font-bold text-on-surface-variant mb-1">
                    Photo Title / Headline (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Science Lab Autonomous Rover Challenge"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 focus:border-primary outline-none font-body text-sm text-on-surface"
                  />
                </div>

                {/* TARGET AUDIENCE SELECTION */}
                <div className="bg-surface-container/60 p-4 rounded-2xl border border-outline-variant/30 flex flex-col gap-3">
                  <label className="block font-label text-xs uppercase font-bold text-primary flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    Target Audience *
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Option 1: All Audience */}
                    <button
                      type="button"
                      onClick={() => setAudienceTarget('all')}
                      className={cn(
                        "p-3 rounded-2xl border text-left flex items-start gap-3 transition-all",
                        audienceTarget === 'all'
                          ? "bg-primary/10 border-primary ring-2 ring-primary/30"
                          : "bg-surface-container border-outline-variant/30 hover:bg-surface-variant"
                      )}
                    >
                      <div className="p-2 rounded-xl bg-primary text-on-primary shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-on-surface">1. All Audience</p>
                        <p className="text-[11px] text-on-surface-variant leading-tight mt-0.5">
                          Broadcasts to all students & parents school-wide
                        </p>
                      </div>
                    </button>

                    {/* Option 2: Specific Class */}
                    <button
                      type="button"
                      onClick={() => setAudienceTarget('class')}
                      className={cn(
                        "p-3 rounded-2xl border text-left flex items-start gap-3 transition-all",
                        audienceTarget === 'class'
                          ? "bg-primary/10 border-primary ring-2 ring-primary/30"
                          : "bg-surface-container border-outline-variant/30 hover:bg-surface-variant"
                      )}
                    >
                      <div className="p-2 rounded-xl bg-secondary text-on-secondary shrink-0">
                        <School className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-on-surface">2. Specific Class</p>
                        <p className="text-[11px] text-on-surface-variant leading-tight mt-0.5">
                          Includes students & parents of the selected class
                        </p>
                      </div>
                    </button>
                  </div>

                  {/* Class Picker when 'Specific Class' is selected */}
                  {audienceTarget === 'class' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="pt-2 flex flex-col gap-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-on-surface">{t("Select Specific Classes")} ({selectedClasses.length} selected):
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={selectAllClasses}
                            className="text-[11px] text-primary font-bold hover:underline"
                          >{t("Select All")}</button>
                          <span className="text-outline-variant">•</span>
                          <button
                            type="button"
                            onClick={() => setUseCustomClass(!useCustomClass)}
                            className="text-[11px] text-primary font-bold hover:underline"
                          >
                            {useCustomClass ? "Hide Custom Class" : "+ Custom Class"}
                          </button>
                        </div>
                      </div>

                      {/* Class Choice Chips / Checkboxes */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1.5 border border-outline-variant/30 rounded-2xl bg-surface-container-low">
                        {Array.from(new Set(viewerRole === "teacher" ? dbClasses : [...SCHOOL_CLASSES, ...dbClasses])).map(cls => {
                          const isSelected = selectedClasses.includes(cls);
                          return (
                            <button
                              key={cls}
                              type="button"
                              onClick={() => toggleClassSelection(cls)}
                              className={cn(
                                "px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between gap-1.5 border text-left",
                                isSelected
                                  ? "bg-primary text-on-primary border-primary shadow-sm"
                                  : "bg-surface-container border-outline-variant/30 text-on-surface hover:bg-surface-variant"
                              )}
                            >
                              <span className="truncate">{cls}</span>
                              <Check className={cn("w-3.5 h-3.5 shrink-0 transition-opacity", isSelected ? "opacity-100" : "opacity-0")} />
                            </button>
                          );
                        })}
                      </div>

                      {useCustomClass && (
                        <input
                          type="text"
                          placeholder="Type custom class name(s), comma separated..."
                          value={customClass}
                          onChange={(e) => setCustomClass(e.target.value)}
                          className="w-full px-4 py-2 rounded-xl bg-surface-container border border-outline-variant/40 focus:border-primary outline-none font-body text-xs text-on-surface"
                        />
                      )}

                      <p className="text-[11px] text-primary/90 bg-primary/5 p-2.5 rounded-xl font-medium leading-relaxed">
                        🔒 <strong>Class Privacy:</strong> Photos assigned to specific classes will <strong>only</strong> be visible to students & parents viewing those selected classes (e.g., <strong>{selectedClasses.join(', ') || 'selected classes'}</strong>). Students/parents in other classes will not see these photos.
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Photo Source Input */}
                <div>
                  <label className="block font-label text-xs uppercase font-bold text-on-surface-variant mb-1">
                    Photo Source *
                  </label>

                  <div className="flex flex-col gap-2.5">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="block w-full text-xs text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                    />

                    <div className="text-[11px] text-on-surface-variant font-bold text-center">OR PASTE IMAGE URL / CHOOSE PRESET</div>

                    <input
                      type="url"
                      placeholder="Paste Image URL (https://...)"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setPreviewImage(e.target.value);
                      }}
                      className="w-full px-4 py-2 rounded-xl bg-surface-container border border-outline-variant/40 focus:border-primary outline-none font-body text-xs text-on-surface"
                    />

                    {/* Quick Presets */}
                    {PRESET_IMAGES.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                        {PRESET_IMAGES.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setImageUrl(preset.url);
                              setPreviewImage(preset.url);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-surface-variant text-on-surface text-xs font-medium shrink-0 hover:bg-primary/20 transition-colors"
                          >
                            📷 {preset.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {previewImage && (
                    <div className="mt-3 relative h-36 w-full rounded-2xl overflow-hidden border border-outline-variant/30 bg-black">
                      <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Text Box Explanation */}
                <div>
                  <label className="block font-label text-xs uppercase font-bold text-on-surface-variant mb-1">
                    Photo Explanation & Story Text Box (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Optionally describe classroom activities, learning goals, or student achievements..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant/40 focus:border-primary outline-none font-body text-sm text-on-surface"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-outline-variant/20">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-5 py-2.5 rounded-full bg-surface-variant text-on-surface-variant font-bold text-sm hover:bg-surface-container-high transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isUploading}
                    className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-bold text-sm shadow-md hover:opacity-95 transition-all disabled:opacity-50"
                  >
                    {isUploading ? 'Saving...' : editingPhotoId ? 'Save Changes' : 'Publish Photo Highlight'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
