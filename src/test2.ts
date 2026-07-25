import { fetchVisibleAnnouncements } from "./lib/announcementUtils";
async function runTest() {
  const mockUser = { id: "77e1a165-aac8-46e8-a0bf-76f7ffa14a7f" };
  const adminAnns = await fetchVisibleAnnouncements(mockUser, "admin");
  console.log("Admin visible announcements count:", adminAnns.length);
  const teacherAnns = await fetchVisibleAnnouncements(mockUser, "teacher");
  console.log("Teacher visible announcements count:", teacherAnns.length);
}
runTest().catch(console.error);
