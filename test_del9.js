import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    try {
        const { error } = await supabase.from('newsletters').delete().eq('newsletter_id', undefined);
        console.log("Error for undefined:", error);
    } catch(e) {
        console.log("Caught exception:", e.message);
    }
}
run();
