import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.VITE_SUPABASE_ANON_KEY || '');
async function test() {
  const { error: insErr } = await supabase.from('attendance').insert({
    attendance_date: '2026-06-29',
    class_id: 1,
    student_id: 1,
    marked_by: '11111111-1111-1111-1111-111111111111',
    notes: 'test',
    status: 'Absent'
  }).select();
  console.log("Insert Error:", insErr);
}
test();
