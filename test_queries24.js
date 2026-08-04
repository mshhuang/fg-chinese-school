import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  console.time('limit_30');
  const { error } = await supabase.from('announcements')
      .select('announcement_id')
      .order('created_at', { ascending: false })
      .limit(30);
  console.timeEnd('limit_30');
}
test();
