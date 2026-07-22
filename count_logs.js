import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error, count } = await supabase
    .from('system_logs')
    .select('*', { count: 'exact', head: true })
    .ilike('user_name', '%vickie huang%');
  
  if (error) {
    console.error('Error fetching logs:', error);
  } else {
    console.log(`Found ${count} records for vickie huang in system_logs.`);
  }
}
check();
