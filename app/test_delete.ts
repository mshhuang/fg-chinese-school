import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xfftjqefsirzfemmklku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZnRqcWVmc2lyemZlbW1rbGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNTYxMTIsImV4cCI6MjA5NTYzMjExMn0.4lEC8h3IiZkD3yJmEKk0TiR-2mFxy0jctEWRat1cH5s';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDelete() {
    const { data: anns } = await supabase.from('announcements').select('*').limit(1);
    if (anns && anns.length > 0) {
        console.log("Deleting announcement", anns[0].announcement_id);
        const res = await supabase.from('announcements').delete().eq('announcement_id', anns[0].announcement_id);
        console.log("Delete result:", res);
    }
}
testDelete();
