import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    const { data, error } = await supabase.from('newsletters').delete().eq('newsletter_id', '194fc80b-bfb9-440f-a60f-00124f74ab30');
    console.log("Delete result:", data, "error:", error);
}
run();
