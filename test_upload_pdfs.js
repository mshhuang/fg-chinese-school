import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
    const fileContent = "hello pdfs";
    const filePath = `test_${Date.now()}.txt`;
    const { data, error } = await supabase.storage.from('newsletter_pdfs').upload(filePath, fileContent);
    console.log("Upload result:", data, "error:", error?.message);
}
run();
