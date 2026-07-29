const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
    const { data: uploadData, error: uploadError } = await supabase.storage.from('class_photos').upload('test_delete.txt', 'hello');
    console.log("Upload:", uploadData, uploadError);
    if (uploadData) {
        const { data, error } = await supabase.storage.from('class_photos').remove(['test_delete.txt']);
        console.log("Delete:", data, error);
    }
}
main();
