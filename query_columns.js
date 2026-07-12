import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
async function test() {
  const { data, error } = await supabase.from('information_schema.columns').select('column_name, data_type').eq('table_name', 'attendance').eq('table_schema', 'public');
  console.log(data);
}
test();
