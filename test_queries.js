import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("Missing env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing classIdsPromise...");
  const realUserId = '9a5e12f8-0c6f-474c-836e-1d57f9202a6c'; // Ms. Janice
  console.time('classIds');
  const classRes = await supabase.from('classes').select('class_id')
    .or(`primary_teacher_id.eq.${realUserId},co_teacher_id.eq.${realUserId},co_teachers.cs.{${realUserId}}`);
  console.timeEnd('classIds');
  console.log('classRes error:', classRes.error?.message);

  console.log("Testing annsPromise...");
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
  console.time('anns');
  const annsRes = await supabase.from('announcements')
    .select(selectQuery)
    .order('created_at', { ascending: false })
    .limit(200);
  console.timeEnd('anns');
  console.log('anns error:', annsRes.error?.message);
}

test();
