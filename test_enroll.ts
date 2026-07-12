import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const envStr = fs.readFileSync('.env', 'utf-8');
let url = '', key = '';
for(let line of envStr.split('\n')) {
  if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
}
const supabase = createClient(url, key);
async function run() {
  const { data: e, error } = await supabase.from('enrollments').select('*').limit(3);
  console.log('enrollments:', e, error);
}
run();
