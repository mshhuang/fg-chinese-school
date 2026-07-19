import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const id = '0b58d119-d773-439b-9089-c912b2bd8a80';
  
  // Try deleting from users directly to see the error
  const { error } = await supabase.from('users').delete().eq('user_id', id);
  console.log("Delete error:", error);
}
run();
