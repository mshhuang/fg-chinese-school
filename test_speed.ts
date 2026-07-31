import 'dotenv/config';
import { fetchVisibleAnnouncements } from './src/lib/announcementUtils.js';

async function test() {
    console.log("Starting test...");
    const user = { id: 'c4d458f8-ba08-4fc1-bbbf-c4c1eac64068', role: 'teacher' };
    
    const start = Date.now();
    await fetchVisibleAnnouncements(user, 'teacher');
    console.log("Time taken:", Date.now() - start, "ms");
}
test();
