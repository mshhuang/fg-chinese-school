const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const { data, error } = await supabase.from('lesson_plans').delete().eq('title', 'Google Doc Link');
  console.log("Deleted old lesson plans", error);
}
test();
