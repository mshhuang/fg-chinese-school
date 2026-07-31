import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    const { data: newsletters } = await supabase.from('newsletters').select('newsletter_id');
    if(newsletters && newsletters.length > 0) {
        const id = newsletters[0].newsletter_id;
        // manually insert a read receipt
        await supabase.from('read_receipts').insert({ user_id: 'c4d458f8-ba08-4fc1-bbbf-c4c1eac64068', item_type: 'newsletter', item_id: id });
        const { error } = await supabase.from('newsletters').delete().eq('newsletter_id', id);
        console.log("Delete error with foreign keys?:", error);
    }
}
run();
