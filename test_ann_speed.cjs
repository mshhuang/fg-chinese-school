require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  console.time('fetch_all');
  const selectQuery = `
        *,
        users:created_by ( first_name, last_name, email, user_roles ( roles ( role_name ) ) ),
        roles:target_role_id ( role_name ),
        announcement_replies (
          reply_id,
          content,
          created_at,
          users:user_id ( first_name, last_name, email, user_roles ( roles ( role_name ) ) )
        )
     `;
  const { data: anns, error } = await supabase.from('announcements').select(selectQuery).order('created_at', { ascending: false }).limit(20);
  console.timeEnd('fetch_all');
  console.log('Error:', error);
}
run();
