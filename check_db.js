import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data: users } = await supabase.from('users').select('user_id, first_name, last_name, user_name, email').or('first_name.ilike.%clara%,first_name.ilike.%emily%');
  console.log("Users:", users);

  if (users && users.length > 0) {
    const userIds = users.map(u => u.user_id);
    const { data: classes } = await supabase.from('classes').select('*').in('primary_teacher_id', userIds);
    console.log("Classes (primary):", classes);
    
    const { data: classTeachers } = await supabase.from('class_teachers').select('*').in('teacher_id', userIds);
    console.log("Class Teachers:", classTeachers);
    
    const { data: roles } = await supabase.from('user_roles').select('*, roles(role_name)').in('user_id', userIds);
    console.log("User Roles:", roles);
  }
}

check();
