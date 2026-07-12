import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data: q1, error: e1 } = await supabase.from('system_settings').select('*').limit(1);
  const { data: q2, error: e2 } = await supabase.from('organizations').select('*').limit(1);
  console.log('sys_settings:', e1?.message);
  console.log('organizations:', e2?.message);
}
run();
