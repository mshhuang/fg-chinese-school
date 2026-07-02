import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xfftjqefsirzfemmklku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZnRqcWVmc2lyemZlbW1rbGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNTYxMTIsImV4cCI6MjA5NTYzMjExMn0.4lEC8h3IiZkD3yJmEKk0TiR-2mFxy0jctEWRat1cH5s';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDelete() {
    // insert one
    const { data: ins, error: errIns } = await supabase.from('announcements').insert({ title: 'Test', content: 'Test content' }).select();
    if (errIns) {
        console.error("Insert error", errIns);
        return;
    }
    const id = ins[0].announcement_id;
    console.log("Inserted", id);
    
    // now try to delete
    const { data, error } = await supabase.from('announcements').delete().eq('announcement_id', id);
    console.log("Delete error:", error);
}
testDelete();
