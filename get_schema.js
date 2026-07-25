import { createClient } from "@supabase/supabase-js";
const supabase = createClient("https://xfftjqefsirzfemmklku.supabase.co", process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('class_photos').insert([{ id: 'test-123', title: 'test', image_url: 'test', teacher_name: 'test'}]).select();
  console.log("Insert result:", data, error);
}
run();
