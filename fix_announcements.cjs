const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
    const { data: anns, error } = await supabase.from('announcements').select('announcement_id, content');
    if (error) {
        console.error("Fetch error:", error);
        return;
    }
    
    let fixedCount = 0;
    for (const ann of anns) {
        if (ann.content && ann.content.includes('---ATTACHMENTS---') && ann.content.includes('data:application/pdf;base64,')) {
            console.log("Fixing announcement", ann.announcement_id);
            // We just remove the attachments part or replace base64 with a dummy url
            const parts = ann.content.split('\n\n---ATTACHMENTS---\n');
            const mainContent = parts[0];
            try {
                const attachments = JSON.parse(parts[1]);
                const newAttachments = attachments.map(a => {
                    if (a.url && a.url.startsWith('data:')) {
                        return { name: a.name, url: 'https://via.placeholder.com/150?text=File+Too+Large' };
                    }
                    return a;
                });
                const newContent = mainContent + '\n\n---ATTACHMENTS---\n' + JSON.stringify(newAttachments);
                await supabase.from('announcements').update({ content: newContent }).eq('announcement_id', ann.announcement_id);
                fixedCount++;
            } catch(e) {
                console.error("Failed to parse attachments for", ann.announcement_id);
            }
        }
    }
    console.log("Fixed", fixedCount, "announcements");
}
main();
