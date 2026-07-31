import { fetchVisibleAnnouncements } from './src/lib/announcementUtils.js';
import { supabase } from './src/lib/supabase.js';

async function test() {
    console.time('fetchVisibleAnnouncements');
    const user = { id: 'c4d458f8-ba08-4fc1-bbbf-c4c1eac64068', role: 'teacher' };
    await fetchVisibleAnnouncements(user, 'teacher');
    console.timeEnd('fetchVisibleAnnouncements');
    process.exit(0);
}
test();
