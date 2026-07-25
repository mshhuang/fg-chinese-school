import { createClient } from "@supabase/supabase-js";
const supabase = createClient("https://xfftjqefsirzfemmklku.supabase.co", process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('error_logs').insert([{
    type: 'error',
    message: 'test error'
  }]).select();
  console.log("Insert error_logs:", data, error);
}
run();
