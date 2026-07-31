import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
    const { data } = supabase.storage.from('newsletter_pdfs').getPublicUrl('test_1785506299915.txt');
    console.log("Public URL:", data);
}
run();
