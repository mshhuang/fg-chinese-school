import { supabase } from './src/lib/supabase.js';

async function run() {
    const { data, error } = await supabase.storage.from('newsletter_pdfs').list();
    console.log("Bucket contents:", data?.length, "error:", error);
}
run();
