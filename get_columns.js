import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const r1 = await supabase.from('error_logs').select('*').limit(1);
  console.log('error_logs:', r1.error ? r1.error.message : Object.keys(r1.data[0] || {}));
  const r2 = await supabase.from('audit_logs').select('*').limit(1);
  console.log('audit_logs:', r2.error ? r2.error.message : Object.keys(r2.data[0] || {}));
}
run();
