import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    // try to delete a non-existent row to see if it causes an RLS error or just completes without error
    const { data, error } = await supabase.from('newsletters').delete().eq('newsletter_id', 999999);
    console.log("Error:", error);
}
run();
