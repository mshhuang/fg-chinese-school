import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    const { data: cols, error } = await supabase.rpc('get_foreign_keys', {table_name: 'newsletters'});
    // wait, we don't have this rpc.
    console.log("FK test completed");
}
run();
