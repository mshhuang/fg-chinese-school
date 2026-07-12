import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const env = fs.readFileSync('.env.example', 'utf8');
const supabaseUrlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const supabaseKeyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);
const supabaseUrl = supabaseUrlMatch[1].trim();
const supabaseKey = supabaseKeyMatch[1].trim();
const supabase = createClient(supabaseUrl, supabaseKey);
async function test() {
  const { data } = await supabase.from('classes').select('*').limit(1);
  if (data && data.length > 0) {
     console.log('classes', Object.keys(data[0]));
  } else {
     console.log('classes', 'empty');
  }
}
test();
