const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const { data } = await supabase.from('users').select('user_id, first_name, last_name, user_roles(roles(role_name))');
  let allowedUsers = data.map((u) => ({
    ...u,
    role_names: (u.user_roles || []).map((ur) => ur.roles?.role_name).filter(Boolean)
  })).filter(u => !(u.first_name === 'Youlin' && u.last_name === 'Venerable'));
  
  const desiredOrder = ['Admin', 'Teacher', 'Student', 'Parent', 'Volunteer', 'Staff', 'Builder'];
  const getPrimaryRole = (roles) => {
      if (!roles || roles.length === 0) return 'Others';
      let bestIdx = 999;
      let bestRole = 'Others';
      for (const r of roles) {
          const idx = desiredOrder.indexOf(r);
          if (idx !== -1 && idx < bestIdx) {
              bestIdx = idx;
              bestRole = r;
          }
      }
      if (bestIdx === 999) return roles[0];
      return bestRole;
  };
  const groupedUsers = {};
  allowedUsers.forEach(u => {
      const primary = getPrimaryRole(u.role_names || []);
      if (!groupedUsers[primary]) groupedUsers[primary] = [];
      groupedUsers[primary].push(u);
  });
  console.log(groupedUsers['Teacher'].filter(u => u.first_name === 'Vickie'));
}
test();
