import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: cols } = await supabase.rpc('get_schema_info'); 
  console.log("RPC:", cols);
  const { data: tables } = await supabase.from('class_teachers').select('*').limit(1);
  console.log("class_teachers:", tables);
}
run();
