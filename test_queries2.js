import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
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
  const { data: anns } = await supabase.from('announcements').select(selectQuery).order('created_at', { ascending: false }).limit(200);
  
  if (!anns || anns.length === 0) return console.log("No anns");

  console.log("Testing replies...");
  const annIds = anns.map(a => a.announcement_id);
  console.time('replies');
  const repliesRes = await supabase.from('announcement_replies')
      .select('reply_id, announcement_id, content, created_at, user_id, users(first_name, last_name, email)')
      .in('announcement_id', annIds);
  console.timeEnd('replies');
  console.log('replies error:', repliesRes.error?.message);
}

test();
