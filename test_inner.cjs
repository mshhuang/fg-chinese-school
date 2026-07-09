const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data } = await supabase
    .from('assignments')
    .select('assignment_id, teacher_id, assignment_students!inner(status)')
    .eq('teacher_id', '9512a15a-f2c0-4bd9-96b8-c05ebaed05ea')
    .eq('assignment_students.status', 'submitted');
  console.log(JSON.stringify(data, null, 2));
}
run();
