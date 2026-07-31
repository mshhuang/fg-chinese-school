import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    const fileContent = "hello world";
    const filePath = `announcements/test_${Date.now()}.txt`;
    const { data, error } = await supabase.storage.from('announcements').upload(filePath, fileContent, { contentType: 'text/plain' });
    console.log("Upload result:", data, "error:", error?.message);
}
run();
