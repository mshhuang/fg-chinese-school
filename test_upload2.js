import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    const fileContent = "hello world announcements";
    const { data, error } = await supabase.storage.from('announcements').upload(`test_${Date.now()}.txt`, fileContent, { contentType: 'text/plain' });
    console.log("Upload result:", data, "error:", error?.message);
}
run();
