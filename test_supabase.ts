import { supabase } from './src/lib/supabase';
async function test() {
  const { data } = await supabase.from('assignments').select('*, assignment_students(*)').limit(1);
  console.log(JSON.stringify(data, null, 2));
}
test();
