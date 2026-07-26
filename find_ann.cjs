const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function main() {
  const { data: anns, error } = await supabase.from('announcements').select('announcement_id, content, created_by').ilike('content', '%Li%');
  console.log("Anns with Li:", anns?.map(a => a.announcement_id));
  
  const { data: anns2, error: e2 } = await supabase.from('announcements').select('announcement_id, created_by').eq('created_by', '33881bb6-b698-460c-82b8-7c49229e8c59');
  console.log("Anns by Yang Li:", anns2);
}
main();
