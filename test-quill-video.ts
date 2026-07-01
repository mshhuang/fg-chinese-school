import { supabase } from './src/lib/supabase';

async function test() {
  const content = '<p>Video here:</p><iframe class="ql-video" src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe><p>Link here: <a href="https://youtube.com/watch?v=dQw4w9WgXcQ">https://youtube.com/watch?v=dQw4w9WgXcQ</a></p>';
  
  const { data, error } = await supabase.from('announcements').insert({
    title: 'Test Video',
    content: content,
    created_by: 'demo'
  }).select();
  
  console.log(data, error);
}

test();
