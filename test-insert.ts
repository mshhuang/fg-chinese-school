import { supabase } from './src/lib/supabase';
async function test() {
   const res = await supabase.from('roles').select('*');
   console.log('roles', res.data);
   const { data, error } = await supabase.from('announcements').insert({
       title: "test", content: "content", created_by: null, target_role_id: 2
   }).select(`
       announcement_id, title, content, created_by, target_role_id, target_program_id,
       users:created_by ( first_name, last_name, email ),
       roles:target_role_id ( role_name )
   `).single();
   console.log(data, error);
}
test();
