import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.rpc('run_sql', { sql: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';" });
  console.log(data);
}
check();
