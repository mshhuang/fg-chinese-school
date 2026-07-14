import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkPasswords() {
  const { data: rolesData, error: rError } = await supabase.from('roles').select('*');
  const roleIdMap = {};
  rolesData?.forEach(r => roleIdMap[r.role_id] = r.role_name);

  const { data: users, error } = await supabase.from('users').select('user_id, password_hash, first_name, last_name, email, user_name');
  
  const { data: userRoles, error: rolesError } = await supabase.from('user_roles').select('user_id, role_id');

  const roleMap = {};
  userRoles?.forEach(r => {
    if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
    roleMap[r.user_id].push(roleIdMap[r.role_id]);
  });
  
  users?.forEach(u => {
    u.roles = roleMap[u.user_id] || ['none'];
  });
  
  const parents = users.filter(u => u.roles.includes('Parent'));
  console.log('Parents:', parents);
  
  const emails = users.map(u => u.email).filter(e => e);
  const emailCounts = {};
  emails.forEach(e => emailCounts[e] = (emailCounts[e] || 0) + 1);
  
  const multiEmailUsers = users.filter(u => u.email && emailCounts[u.email] > 1);
  const multiEmailStats = {};
  multiEmailUsers.forEach(u => {
    multiEmailStats[u.password_hash] = (multiEmailStats[u.password_hash] || 0) + 1;
  });
  console.log('Multi-email users passwords:', multiEmailStats);

}
checkPasswords();
