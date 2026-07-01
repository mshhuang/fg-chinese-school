import { supabase } from "./src/lib/supabase";

async function run() {
  const { data } = await supabase.from('system_logs').select('*').limit(1);
  console.log(data);
}
run();
