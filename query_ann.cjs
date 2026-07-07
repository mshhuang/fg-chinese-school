const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function check() {
  const { data } = await supabase.from('announcements').select('announcement_id, title, target_role_ids, target_class_ids, target_user_ids, target_role_id');
  console.log(JSON.stringify(data, null, 2));
}
check();
