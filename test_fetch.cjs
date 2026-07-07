const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data: anns } = await supabase.from('announcements').select('*');
  let allAnns = anns || [];
  
  // Fake user
  const user = { id: 'some-student-id' };
  const userRole = '';
  
  const userRoleId = null;
  const userClassIds = [];
  
  const filteredAnns = allAnns.filter(a => {
       if (a.created_by === user.id) return true;
       
       const noTargets = !a.target_role_ids?.length && !a.target_class_ids?.length && !a.target_user_ids?.length && !a.target_role_id;
       if (noTargets) return true;
       
       if (userRoleId && a.target_role_ids?.includes(userRoleId)) return true;
       if (userRoleId && a.target_role_id === userRoleId) return true;
       if (a.target_user_ids?.includes(user.id)) return true;
       
       if (a.target_class_ids && a.target_class_ids.length > 0) {
           if (a.target_class_ids.some(cId => userClassIds.includes(cId))) {
               return true;
           }
       }
       
       return false;
   });
   
   console.log("Filtered:", filteredAnns.length);
}
test();
