import { createClient } from "@supabase/supabase-js";
import 'dotenv/config'; // Make sure this is available or pass env directly

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://xfftjqefsirzfemmklku.supabase.co";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZnRqcWVmc2lyemZlbW1rbGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNTYxMTIsImV4cCI6MjA5NTYzMjExMn0.4lEC8h3IiZkD3yJmEKk0TiR-2mFxy0jctEWRat1cH5s";
const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
  console.time("Select with joins");
  const selectQuery = `
    announcement_id,
    title,
    content,
    created_at,
    created_by,
    target_role_id,
    target_role_ids,
    target_class_ids,
    target_user_ids,
    users:created_by ( first_name, last_name, email ),
    roles:target_role_id ( role_name )
  `;
  const { data, error } = await supabase.from('announcements').select(selectQuery).order('created_at', { ascending: false }).limit(25);
  console.timeEnd("Select with joins");
  console.log("Error:", error);
  console.log("Count:", data?.length);
  
  console.time("Select without joins");
  const { data: d2, error: e2 } = await supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(25);
  console.timeEnd("Select without joins");
  console.log("Error without joins:", e2);
  console.log("Count without joins:", d2?.length);
}
runTest().catch(console.error);
