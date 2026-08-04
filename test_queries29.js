import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const realUserId = '9a5e12f8-0c6f-474c-836e-1d57f9202a6c';
  const userRoleId = 3;
  const userClassIds = [ '3ed2e5c0-40e9-4e78-bcbf-0658e37bcde8', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' ];
  
  const orConditions = [];
  orConditions.push(`created_by.eq.${realUserId}`);
  if (userRoleId) {
      orConditions.push(`target_role_ids.cs.{${userRoleId}}`);
      orConditions.push(`target_role_id.eq.${userRoleId}`);
  }
  orConditions.push(`target_user_ids.cs.{${realUserId}}`);
  if (userClassIds && userClassIds.length > 0) {
      const classIdsStr = userClassIds.join(',');
      orConditions.push(`target_class_ids.ov.{${classIdsStr}}`);
  }
  orConditions.push(`and(target_role_id.is.null,target_role_ids.eq.{},target_class_ids.eq.{},target_user_ids.eq.{})`);
  
  const orString = orConditions.join(',');
  
  console.time('fetch');
  const annsPromise = supabase.from('announcements')
      .select('announcement_id')
      .order('created_at', { ascending: false })
      .limit(50)
      .or(orString);
      
  const { error } = await annsPromise;
  console.timeEnd('fetch');
  console.log('error', error);
}
test();
