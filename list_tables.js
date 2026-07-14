import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function list() {
  const { data, error } = await supabase.from('users').select('*').limit(1);
  console.log("users table columns:", Object.keys(data[0]));
}
list();
