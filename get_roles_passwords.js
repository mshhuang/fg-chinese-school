import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkPasswords() {
  const { data: users, error } = await supabase
    .from('users')
    .select('user_id, password_hash');
    
  if (error) {
    console.error(error);
    return;
  }
  
  const { data: roles, error: rolesError } = await supabase
    .from('user_roles')
    .select('user_id, role');

  if (rolesError) {
    console.error(rolesError);
    return;
  }
  
  const roleMap = {};
  roles.forEach(r => {
    if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
    roleMap[r.user_id].push(r.role);
  });
  
  const stats = {};
  users.forEach(u => {
    const userRoles = roleMap[u.user_id] || ['none'];
    const pwd = u.password_hash;
    const roleKey = userRoles.sort().join(',');
    if (!stats[roleKey]) stats[roleKey] = {};
    stats[roleKey][pwd] = (stats[roleKey][pwd] || 0) + 1;
  });
  
  console.log(stats);
}
checkPasswords();
