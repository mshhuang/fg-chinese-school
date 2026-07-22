import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function deleteLogs() {
  const { data, error } = await supabase
    .from('system_logs')
    .delete()
    .ilike('user_name', '%vickie huang%');
  
  if (error) {
    console.error('Error deleting logs:', error);
  } else {
    console.log(`Successfully deleted logs for vickie huang.`);
  }
}
deleteLogs();
