import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  console.time('filtered');
  const { error } = await supabase.from('announcements')
      .select('*')
      .eq('created_by', '9a5e12f8-0c6f-474c-836e-1d57f9202a6c')
      .order('created_at', { ascending: false })
      .limit(50);
  console.timeEnd('filtered');
  console.log('err:', error?.message);
}
test();
