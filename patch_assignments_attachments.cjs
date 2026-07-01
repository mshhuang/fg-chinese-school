import { supabase } from './src/lib/supabase';

async function run() {
  const { error } = await supabase.rpc('execute_sql', {
    sql_query: `
      ALTER TABLE assignments ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;
    `
  });
  
  if (error) {
    // maybe we don't have execute_sql rpc, let's just do it directly via a query or another way?
    console.error("RPC failed, trying to create it via supabase directly...", error);
  } else {
    console.log("Migration applied.");
  }
}
run();
