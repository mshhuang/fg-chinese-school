const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data: u } = await supabase.from('users').select('*').eq('email', 'janice.yang267@gmail.com').single();
  if (!u) return console.log('no janice');
  
  const user = { id: u.user_id };
  const userRole = 'parent';
  
  const { data: anns } = await supabase.from('announcements').select('*');
  let allAnns = anns || [];
  
  const { data: rolesRes } = await supabase.from('roles').select('*');
  const userRoleId = rolesRes?.find(r => r.role_name.toLowerCase() === userRole.toLowerCase())?.role_id;
  
  let userClassIds = [];
  const { data: children } = await supabase.from('parent_child').select('child_id').eq('parent_id', user.id);
  if (children && children.length > 0) {
      const childIds = children.map(c => c.child_id);
      const { data: enrollments } = await supabase.from('enrollments').select('class_id').in('student_id', childIds);
      if (enrollments) userClassIds = enrollments.map(e => e.class_id);
  }
  
  console.log("Parent class IDs:", userClassIds);

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
   
   console.log("Visible anns:", filteredAnns.map(a => a.title));
}
test();
