require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  console.time('fetch');
  const selectQuery = `
        *,
        users:created_by ( first_name, last_name, email ),
        roles:target_role_id ( role_name ),
        announcement_replies (
          reply_id,
          content,
          created_at,
          user_id,
          users:user_id ( first_name, last_name, email )
        )
     `;
  const { data: anns, error } = await supabase.from('announcements').select(selectQuery).order('created_at', { ascending: false }).limit(50);
  
     if (anns) {
         const userIds = new Set();
         anns.forEach(a => {
             if (a.created_by) userIds.add(a.created_by);
             a.announcement_replies?.forEach(r => {
                 if (r.user_id) userIds.add(r.user_id);
             });
         });
         
         const uIdArray = Array.from(userIds);
         if (uIdArray.length > 0) {
             const { data: uRoles } = await supabase.from('user_roles').select('user_id, roles(role_name)').in('user_id', uIdArray);
             const roleMap = {};
             uRoles?.forEach(ur => {
                 if (!roleMap[ur.user_id]) roleMap[ur.user_id] = [];
                 roleMap[ur.user_id].push(ur);
             });
             
             anns.forEach(a => {
                 if (a.users) a.users.user_roles = roleMap[a.created_by] || [];
                 a.announcement_replies?.forEach(r => {
                     if (r.users) r.users.user_roles = roleMap[r.user_id] || [];
                 });
             });
         }
     }
  console.timeEnd('fetch');
  console.log(anns && anns.length > 0 ? anns[0].users : null);
}
run();
