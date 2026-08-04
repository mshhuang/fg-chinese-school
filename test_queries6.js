import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const realUserId = '9a5e12f8-0c6f-474c-836e-1d57f9202a6c';

  const selectQuery = `
      announcement_id,
      title,
      content,
      created_at,
      created_by,
      target_role_id,
      target_role_ids,
      target_class_ids,
      target_user_ids,
      users:created_by ( first_name, last_name, email ),
      roles:target_role_id ( role_name )
  `;

  console.time('fetch_all');
  
  const annsPromise = supabase.from('announcements')
      .select(selectQuery)
      .order('created_at', { ascending: false })
      .limit(200);
      
  const rolesPromise = supabase.from('roles').select('*');
  const classIdsPromise = supabase.from('classes').select('class_id')
      .or(`primary_teacher_id.eq.${realUserId},co_teacher_id.eq.${realUserId},co_teachers.cs.{${realUserId}}`)
      .then(res => (res.data?.map(c => c.class_id) || []));

  const [{ data: primaryData, error: primaryErr }, { data: rolesData }, userClassIds] = await Promise.all([
      annsPromise,
      rolesPromise,
      classIdsPromise
  ]);
  
  console.log('primaryErr:', primaryErr?.message);
  console.timeEnd('fetch_all');
}
test();
