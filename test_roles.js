import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const env = fs.readFileSync('.env.example', 'utf8');
const supabaseUrlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const supabaseKeyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);
const supabase = createClient(supabaseUrlMatch[1].trim(), supabaseKeyMatch[1].trim());
async function test() {
  const { data } = await supabase.from('roles').select('*');
  console.log(data);
}
test();
