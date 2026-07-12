import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8');
const supabaseUrlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const supabaseKeyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

const supabaseUrl = supabaseUrlMatch[1];
const supabaseKey = supabaseKeyMatch[1];

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const tables = ['users', 'classes', 'enrollments', 'programs', 'newsletters'];
  for (const t of tables) {
      const { data } = await supabase.from(t).select('*').limit(1);
      if (data && data.length > 0) {
         console.log(t, Object.keys(data[0]));
      } else {
         console.log(t, 'empty');
      }
  }
}
test();
