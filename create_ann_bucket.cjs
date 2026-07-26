const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
    const sql = `
    insert into storage.buckets (id, name, public)
    values ('announcements', 'announcements', true)
    on conflict (id) do nothing;

    create policy "announcements_select"
      on storage.objects for select
      using ( bucket_id = 'announcements' );

    create policy "announcements_insert"
      on storage.objects for insert
      with check ( bucket_id = 'announcements' );

    create policy "announcements_update"
      on storage.objects for update
      with check ( bucket_id = 'announcements' );

    create policy "announcements_delete"
      on storage.objects for delete
      using ( bucket_id = 'announcements' );
    `;
    const { data, error } = await supabase.rpc('run_sql', { sql });
    console.log(error || "Success");
}
main();
