import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const { error } = await supabase.rpc('run_sql', { sql: "ALTER TABLE classes ADD COLUMN IF NOT EXISTS co_teachers UUID[] DEFAULT '{}';" });
  console.log('rpc error:', error);
}
test();
