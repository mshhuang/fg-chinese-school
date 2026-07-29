const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
    const sql = `
    drop policy if exists "Give public access to all buckets" on storage.objects;
    drop policy if exists "class_photos_select" on storage.objects;
    drop policy if exists "class_photos_insert" on storage.objects;
    drop policy if exists "class_photos_update" on storage.objects;
    drop policy if exists "class_photos_delete" on storage.objects;
    
    drop policy if exists "newsletter_pdfs_select" on storage.objects;
    drop policy if exists "newsletter_pdfs_insert" on storage.objects;
    drop policy if exists "newsletter_pdfs_update" on storage.objects;
    drop policy if exists "newsletter_pdfs_delete" on storage.objects;

    create policy "public_access" on storage.objects for select using (true);
    create policy "public_insert" on storage.objects for insert with check (true);
    create policy "public_update" on storage.objects for update using (true);
    create policy "public_delete" on storage.objects for delete using (true);
    `;
    const { data, error } = await supabase.rpc('run_sql', { sql });
    console.log("Run SQL:", data, error);
}
main();
