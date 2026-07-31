import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    const { data } = await supabase.from('newsletters').select('newsletter_id, content');
    const withId = data.filter(d => {
        try {
            const parsed = JSON.parse(d.content || '{}');
            return 'id' in parsed;
        } catch { return false; }
    });
    console.log("Rows with 'id' in content:", withId.length, withId);
}
run();
