const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data: plans } = await supabase.from('lesson_plans').select('*');
  console.log(plans);
}
test();
