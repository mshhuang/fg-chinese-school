import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  console.time('complex_or');
  const orConds = [
    `created_by.eq.9a5e12f8-0c6f-474c-836e-1d57f9202a6c`,
    `and(target_role_id.is.null,target_role_ids.eq.{},target_class_ids.eq.{},target_user_ids.eq.{})`
  ];
  
  const { data, error } = await supabase.from('announcements')
      .select('title')
      .or(orConds.join(','))
      .order('created_at', { ascending: false })
      .limit(50);
  console.timeEnd('complex_or');
  console.log('err:', error?.message);
  console.log('data len:', data?.length);
}
test();
