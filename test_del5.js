import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    // what if we use string but not uuid?
    const { data, error } = await supabase.from('newsletters').delete().eq('newsletter_id', 'not-a-uuid');
    console.log("Error for non uuid string:", error);
}
run();
