import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('system_logs').delete().neq('log_id', '00000000-0000-0000-0000-000000000000');
  console.log('system_logs:', error ? error.message : 'success');
}
run();
