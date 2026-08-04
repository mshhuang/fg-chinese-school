import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const realUserId = '9a5e12f8-0c6f-474c-836e-1d57f9202a6c';
  // Ms. Janice's classes
  const userClassIds = [ '3ed2e5c0-40e9-4e78-bcbf-0658e37bcde8', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' ];
  const userRoleId = 3; // teacher

  const orConditions = [
    `created_by.eq.${realUserId}`,
    `target_role_id.eq.${userRoleId}`,
    `target_role_ids.cs.{${userRoleId}}`,
    `target_user_ids.cs.{${realUserId}}`,
  ];
  if (userClassIds.length > 0) {
      orConditions.push(`target_class_ids.ov.{${userClassIds.join(',')}}`);
  }
  
  // Also we want announcements with NO targets
  // PostgREST doesn't have an easy "array is empty" in .or() unless we do target_role_ids.eq.{}, etc.
  // We can just fetch them in JS, but let's test this OR query first to see if it's fast.
  const orString = orConditions.join(',');
  
  console.time('or_query');
  const { data, error } = await supabase.from('announcements')
      .select('announcement_id')
      .or(orString)
      .order('created_at', { ascending: false })
      .limit(50);
  console.timeEnd('or_query');
  console.log('err:', error?.message);
  console.log('len:', data?.length);
}
test();
