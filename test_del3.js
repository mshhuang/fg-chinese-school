import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    const { data, error } = await supabase.from('newsletters').select('newsletter_id').limit(1);
    console.log("ID type:", typeof data[0].newsletter_id, "Value:", data[0].newsletter_id);
}
run();
