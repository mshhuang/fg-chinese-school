import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function main() {
    const { data, error } = await supabase.from('system_logs').select('*').order('created_at', { ascending: false }).limit(5);
    if (error) console.error(error);
    else console.log(JSON.stringify(data, null, 2));
}
main();
