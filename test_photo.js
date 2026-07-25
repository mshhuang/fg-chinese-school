import { createClient } from "@supabase/supabase-js";
const supabase = createClient("https://xfftjqefsirzfemmklku.supabase.co", process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('class_photos').insert([{
    id: 'b5a26c80-1234-5678-90ab-cdef12345678',
    title: 'test photo',
    image_url: 'test.jpg',
    teacher_name: 'Mr. Smith'
  }]).select();
  console.log("Insert photo:", data, error);
}
run();
