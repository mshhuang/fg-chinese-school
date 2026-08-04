import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  console.time('no_join');
  const { error } = await supabase.from('announcements')
      .select('announcement_id, title, content, created_at, created_by, target_role_id, target_role_ids, target_class_ids, target_user_ids')
      .order('created_at', { ascending: false })
      .limit(200);
  console.timeEnd('no_join');
  console.log('err:', error?.message);
}
test();
