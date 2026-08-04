import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data } = await supabase.from('announcements')
      .select('title')
      .is('target_class_ids', null);
  console.log('null class ids len:', data?.length);
  
  const { data: d2 } = await supabase.from('announcements')
      .select('title')
      .filter('target_class_ids', 'eq', '{}');
  console.log('empty class ids len:', d2?.length);
}
test();
