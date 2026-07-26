const fs = require('fs');
let code = fs.readFileSync('src/pages/Announcements.tsx', 'utf8');

const targetStr = `  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
       alert("File is too large. Max 2MB allowed.");
       return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
       const dataUrl = event.target?.result as string;
       setComposeAttachments(prev => [...prev, { name: file.name, url: dataUrl }]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };`;

const newStr = `  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
       alert("File is too large. Max 10MB allowed.");
       return;
    }
    setIsSubmitting(true);
    try {
        const ext = file.name.split('.').pop() || 'file';
        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '').substring(0, 30);
        const filePath = \`announcements/\${Date.now()}_\${Math.random().toString(36).substring(2, 7)}_\${safeName}\`;
        
        const { error: uploadError } = await supabase.storage
            .from('class_photos')
            .upload(filePath, file, { cacheControl: '3600', upsert: false });
            
        if (!uploadError) {
            const { data } = supabase.storage.from('class_photos').getPublicUrl(filePath);
            setComposeAttachments(prev => [...prev, { name: file.name, url: data.publicUrl }]);
        } else {
            console.error("Storage upload failed:", uploadError);
            alert("Could not upload file: " + uploadError.message);
        }
    } catch (err) {
        console.error("Upload error", err);
        alert("Failed to upload the file.");
    } finally {
        setIsSubmitting(false);
    }
    e.target.value = '';
  };`;

if (!code.includes(targetStr)) {
    console.error("Target string not found in Announcements.tsx!");
    process.exit(1);
}

code = code.replace(targetStr, newStr);
fs.writeFileSync('src/pages/Announcements.tsx', code);
