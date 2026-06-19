import { supabase } from './src/lib/supabase';
async function test() {
  const { data } = await supabase.from('programs').select('*');
  console.log(data);
}
test();
