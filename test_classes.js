import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('classes').select('*, programs(program_name), users:primary_teacher_id(first_name, last_name), co_teacher:co_teacher_id(first_name, last_name), co_teachers');
  console.log('Error:', error);
}
run();
