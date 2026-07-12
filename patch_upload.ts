import fs from 'fs';
const content = fs.readFileSync('src/pages/PrincipalClasses.tsx', 'utf-8');
const lines = content.split('\n');
const insertIndex = lines.findIndex(line => line.includes('const handleAddClass = async'));
const newFunc = `
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
lines.splice(insertIndex, 0, newFunc);
fs.writeFileSync('src/pages/PrincipalClasses.tsx', lines.join('\n'));
