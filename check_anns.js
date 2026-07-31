import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data: anns } = await supabase.from('announcements').select('announcement_id, title, target_role_id, target_role_ids, target_class_ids, target_user_ids');
  console.log("Announcements:", JSON.stringify(anns, null, 2));
}
check();
