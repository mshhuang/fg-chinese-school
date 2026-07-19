import { supabase } from './src/lib/supabase';
async function run() {
    const { error } = await supabase.from('assignment_students').update({
        status: 'submitted',
        feedback: 'This is a test submission by a student.\n\nLine 2.'
    }).neq('assignment_student_id', 0);
    console.log(error ? error : "Success");
}
run();
