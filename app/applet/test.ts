import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xfftjqefsirzfemmklku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZnRqcWVmc2lyemZlbW1rbGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNTYxMTIsImV4cCI6MjA5NTYzMjExMn0.4lEC8h3IiZkD3yJmEKk0TiR-2mFxy0jctEWRat1cH5s';
const supabase = createClient(supabaseUrl, supabaseKey);

async function query() {
  const { data: users } = await supabase.from('users').select('*').ilike('first_name', '%Liam%');
  console.log('Liam Users:', users);
  
  if (users && users.length > 0) {
    const liamId = users[0].user_id;
    const { data: enrollments } = await supabase.from('enrollments').select('*').eq('student_id', liamId);
    console.log('Enrollments:', enrollments);
    
    if (enrollments && enrollments.length > 0) {
      for (const enr of enrollments) {
        if (enr.class_id) {
            const { data: classes } = await supabase.from('classes').select('*').eq('class_id', enr.class_id);
            console.log('Class:', classes);
        }
      }
    }
  }
}
query();
