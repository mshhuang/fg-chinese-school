import { supabase } from './src/lib/supabase';

async function main() {
  const { data, error } = await supabase.from('assignments').select('attachments').limit(1);
  if (error && error.code === 'PGRST204') {
     console.log("Column doesn't exist, we should run SQL via REST API if we can, but we can't directly alter table from client.");
  }
  console.log(error || data);
}
main();
