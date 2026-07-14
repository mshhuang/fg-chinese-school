import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { count, error } = await supabase
    .from('system_logs')
    .select('*', { count: 'exact', head: true });
  
  if (error) {
    console.error(error);
  } else {
    console.log("Total exact rows in system_logs:", count);
  }

  // Let's also see the oldest log date in system_logs
  const { data: oldest, error: oldestError } = await supabase
    .from('system_logs')
    .select('created_at')
    .order('created_at', { ascending: true })
    .limit(5);

  if (oldestError) {
    console.error(oldestError);
  } else {
    console.log("Oldest log dates in system_logs:", oldest);
  }
}

run();
