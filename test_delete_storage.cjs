const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
    const { data, error } = await supabase.storage.from('class_photos').remove(['some_nonexistent_file.jpg']);
    console.log("Delete response:", data, error);
}
main();
