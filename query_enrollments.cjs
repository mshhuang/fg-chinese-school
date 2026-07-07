const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function check() {
  const { data } = await supabase.from('enrollments').select('*').eq('class_id', '0bd5547a-d3ad-4057-b497-f3eca33093c7');
  console.log("Enrollments:", data.length);
}
check();
