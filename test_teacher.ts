import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: users } = await supabase.from('users').select('*').eq('email', 'janice.yang267@gmail.com');
  const user = users?.[0];
  if (user) {
    console.log("User:", user.user_id);
    const { data: userRoles } = await supabase.from('user_roles').select('*').eq('user_id', user.user_id);
    console.log("User Roles:", userRoles);
    
    const { data: classes } = await supabase.from('classes').select('*').eq('primary_teacher_id', user.user_id);
    console.log("Classes:", classes);
    
    // Also try fetch by user_roles if teacher
    
  }
}
run();
