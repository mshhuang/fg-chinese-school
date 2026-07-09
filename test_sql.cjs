const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.rpc('execute_sql', { query: "ALTER TABLE classes ADD COLUMN co_teacher_id UUID REFERENCES users(user_id);" });
  console.log(error || data);
}
run();
