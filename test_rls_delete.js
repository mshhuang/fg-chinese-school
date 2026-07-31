import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    // Attempt to delete a row that the anon key is NOT allowed to delete
    // We assume anon key is not allowed to delete because there's usually an RLS policy like "users can delete their own"
    // Since anon has no session, it shouldn't be able to delete.
    // Let's insert a row, then delete it.
    
    const { data: newsletters } = await supabase.from('newsletters').select('newsletter_id');
    if (newsletters && newsletters.length > 0) {
        const id = newsletters[0].newsletter_id;
        const { data, error } = await supabase.from('newsletters').delete().eq('newsletter_id', id);
        console.log("Delete result with RLS:", { data, error });
    }
}
run();
