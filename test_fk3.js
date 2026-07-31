import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    // try inserting a read receipt with a bogus item_id for a newsletter
    const { error } = await supabase.from('read_receipts').insert({ user_id: 'c4d458f8-ba08-4fc1-bbbf-c4c1eac64068', item_type: 'newsletter', item_id: '99999999-9999-9999-9999-999999999999' });
    console.log("Insert with bogus item_id error:", error);
}
run();
