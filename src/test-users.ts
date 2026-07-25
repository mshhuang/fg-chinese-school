import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://xfftjqefsirzfemmklku.supabase.co";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZnRqcWVmc2lyemZlbW1rbGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNTYxMTIsImV4cCI6MjA5NTYzMjExMn0.4lEC8h3IiZkD3yJmEKk0TiR-2mFxy0jctEWRat1cH5s";
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data } = await supabase.from("users").select("first_name, last_name, user_roles(roles(role_name))").limit(100);
  const teachers = data?.filter((u: any) => u.user_roles?.some((ur: any) => ur.roles?.role_name === 'teacher' || ur.roles?.role_name === 'admin' || ur.roles?.role_name === 'principal' || ur.roles?.role_name === 'staff'));
  console.log(teachers);
}
run();
