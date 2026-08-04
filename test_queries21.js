import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const realUserId = '9a5e12f8-0c6f-474c-836e-1d57f9202a6c';
  const orConditions = [
    `created_by.eq.${realUserId}`,
    `target_role_id.is.null`
  ];
  console.time('or_query');
  const { data, error } = await supabase.from('announcements')
      .select('announcement_id')
      .or(orConditions.join(','))
      .order('created_at', { ascending: false })
      .limit(50);
  console.timeEnd('or_query');
  console.log('err:', error?.message);
}
test();
