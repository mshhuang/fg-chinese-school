import { createClient } from "@supabase/supabase-js";
const supabase = createClient("https://xfftjqefsirzfemmklku.supabase.co", process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZnRqcWVmc2lyemZlbW1rbGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNTYxMTIsImV4cCI6MjA5NTYzMjExMn0.4lEC8h3IiZkD3yJmEKk0TiR-2mFxy0jctEWRat1cH5s");
async function run() {
  const { data } = await supabase.from("users").select("user_id, email, first_name").ilike("first_name", "%Janice%");
  console.log(data);
  process.exit(0);
}
run();
