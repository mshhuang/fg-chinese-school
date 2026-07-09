import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('users').select('user_id').limit(1); // just a test
  
  // Can't directly query information_schema from REST API typically, unless exposed.
  // We can try:
  const res = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/`, {
    headers: {
        'apikey': process.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`
    }
  });
  const openapi = await res.json();
  console.log(Object.keys(openapi.paths).filter(p => !p.startsWith('/rpc')));
}
run();
