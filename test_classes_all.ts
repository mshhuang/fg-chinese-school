import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: users } = await supabase.from('users').select('*').eq('email', 'janice.yang267@gmail.com');
  console.log("Users with email:", users);
  
  const { data: all_classes } = await supabase.from('classes').select('*');
  console.log("All classes:", all_classes);
}
run();
