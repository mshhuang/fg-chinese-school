const fs = require('fs');
let content = fs.readFileSync('src/pages/PrincipalClasses.tsx', 'utf8');

const replacement = `
  const handleImageUpload = async (classId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingClassId(classId);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = \`\${classId}-\${Math.random().toString(36).substring(2, 9)}.\${fileExt}\`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('class_images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('class_images')
        .getPublicUrl(fileName);

      const publicUrl = publicUrlData.publicUrl;

      // Update classes table
      // @ts-ignore
      const { error: updateError } = await supabase.from('classes').update({ schedule_image_url: publicUrl }).eq('class_id', classId);
      if (updateError) throw updateError;

      // Update local state
      setClassesData(classesData.map(c => 
        c.class_id === classId ? { ...c, schedule_image_url: publicUrl } : c
      ));
    } catch (err: any) {
      alert("Error uploading image. " + err.message);
    } finally {
      setUploadingClassId(null);
    }
  };

  const handleSchoolScheduleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSchoolSchedule(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = \`school-schedule-\${Math.random().toString(36).substring(2, 9)}.\${fileExt}\`;
      
      const { error: uploadError } = await supabase.storage
        .from('class_images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('class_images')
        .getPublicUrl(fileName);

      const publicUrl = publicUrlData.publicUrl;

      const { data: existingData } = await supabase.from('announcements').select('announcement_id').eq('title', 'SYSTEM_SCHOOL_SCHEDULE_URL').single();

      if (existingData) {
         const { error: updateError } = await supabase.from('announcements').update({ content: publicUrl }).eq('announcement_id', existingData.announcement_id);
         if (updateError) throw updateError;
      } else {
         const { error: insertError } = await supabase.from('announcements').insert({ title: 'SYSTEM_SCHOOL_SCHEDULE_URL', content: publicUrl, created_by: currentUserId });
         if (insertError) throw insertError;
      }

      setSchoolScheduleUrl(publicUrl);
    } catch (error) {
      console.error("Error uploading schedule:", error);
      alert("Failed to upload schedule.");
    } finally {
      setUploadingSchoolSchedule(false);
    }
  };
`;

const matchStrRegex = /const toBase64 = \(file: File\) => new Promise<string>\(\(resolve, reject\) => \{[\s\S]*?const handleDeleteClassSchedule = async \(classId: string\) => \{/;
content = content.replace(matchStrRegex, replacement.trim() + '\n\n  const handleDeleteClassSchedule = async (classId: string) => {');

fs.writeFileSync('src/pages/PrincipalClasses.tsx', content);
