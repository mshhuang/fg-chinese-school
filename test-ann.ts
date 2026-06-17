import { supabase } from './src/lib/supabase';

async function run() {
  const { data, error } = await supabase.from('announcements').select('*');
  console.log('Anns:', data);
  console.log('Err:', error);
}
run();
