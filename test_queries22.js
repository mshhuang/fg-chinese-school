import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  console.time('read_receipts');
  const { data, error } = await supabase.from('read_receipts').select('*').limit(50);
  console.timeEnd('read_receipts');
  console.log('err:', error?.message);
}
test();
