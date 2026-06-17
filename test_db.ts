import { supabase } from './src/lib/supabase';

async function run() {
  const { data, error } = await supabase.from('classes').select('*').limit(1);
  console.log(data);
}
run();
