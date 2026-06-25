import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('users').update({ email: 'janice.yang267@gmail.com' }).eq('user_id', 'c3199419-baf6-4cf5-bf30-06c81ce79ed3');
  console.log("Update:", data, error);
}
run();
