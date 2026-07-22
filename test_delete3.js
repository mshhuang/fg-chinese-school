import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const r2 = await supabase.from('audit_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('audit_logs:', r2.error ? r2.error.message : 'success');
}
run();
