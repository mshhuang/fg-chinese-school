const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  console.time('fetch');
  const { data, error } = await supabase.from('announcements')
         .select('*')
         .limit(200);
  console.timeEnd('fetch');
  console.log({ error, count: data?.length });
}
run();
