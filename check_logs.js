import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { count: sysCount } = await supabase.from('system_logs').select('*', { count: 'exact', head: true });
  console.log("system_logs count:", sysCount);
  
  const { count: errCount } = await supabase.from('error_logs').select('*', { count: 'exact', head: true });
  console.log("error_logs count:", errCount);
  
  const { count: msgCount } = await supabase.from('internal_messages').select('*', { count: 'exact', head: true });
  console.log("internal_messages count:", msgCount);
}
run();
