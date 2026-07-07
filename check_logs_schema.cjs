const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const { data, error } = await supabase.from('error_logs').insert({ type: 'support_ticket', message: 'test' }).select();
  console.log(error);
}
test();
