const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
    const { data: anns, error } = await supabase.from('announcements')
        .select('announcement_id')
        .order('created_at', { ascending: false })
        .limit(30);
        
    if (error) {
        console.error("Fetch error:", error);
        return;
    }
    
    let fixedCount = 0;
    for (const ann of anns) {
        const { data: single, error: singleErr } = await supabase.from('announcements')
            .select('announcement_id, content')
            .eq('announcement_id', ann.announcement_id)
            .single();
            
        if (singleErr) {
             console.error("Fetch single err:", singleErr);
             continue;
        }
        
        if (single.content && single.content.includes('---ATTACHMENTS---') && single.content.includes('data:application/pdf;base64,')) {
            console.log("Fixing announcement", single.announcement_id);
            const parts = single.content.split('\n\n---ATTACHMENTS---\n');
            const mainContent = parts[0];
            try {
                const attachments = JSON.parse(parts[1]);
                const newAttachments = attachments.map(a => {
                    if (a.url && a.url.startsWith('data:')) {
                        return { name: a.name, url: 'https://via.placeholder.com/150?text=File+Removed' };
                    }
                    return a;
                });
                const newContent = mainContent + '\n\n---ATTACHMENTS---\n' + JSON.stringify(newAttachments);
                await supabase.from('announcements').update({ content: newContent }).eq('announcement_id', single.announcement_id);
                fixedCount++;
            } catch(e) {
                console.error("Failed to parse attachments for", single.announcement_id);
            }
        }
    }
    console.log("Fixed", fixedCount, "announcements");
}
main();
