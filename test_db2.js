import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: cols } = await supabase.from('classes').select('*, co_teacher_id').limit(1);
  console.log(cols);
}
run();
