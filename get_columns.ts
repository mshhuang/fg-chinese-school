import { supabase } from './src/lib/supabase';

async function test() {
  const { data } = await supabase.from('users').select('*').limit(1);
  if (data && data.length > 0) console.log(Object.keys(data[0]));
}
test();
