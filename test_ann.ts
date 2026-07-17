import { supabase } from './src/lib/supabase.ts';
async function run() {
  const { count, error } = await supabase.from('announcements').select('*', { count: 'exact', head: true });
  console.log(count, error);
}
run();
