import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
    const { data: users } = await supabase.from('users').select('*').ilike('first_name', '%Janice%');
    console.log("Users:", users);

    const { data: clsData } = await supabase.from('classes').select('class_name, primary_teacher_id, co_teacher_id, co_teachers');
    console.log("All Classes:", clsData);
    
    if (users && users.length > 0) {
        const realUserId = users[0].user_id;
        const teacherClasses = clsData.filter((c) => {
            if (c.primary_teacher_id === realUserId || c.co_teacher_id === realUserId) return true;
            if (c.co_teachers && Array.isArray(c.co_teachers) && c.co_teachers.includes(realUserId)) return true;
            return false;
        });
        console.log("Filtered Classes:", teacherClasses);
    }
}
test()
