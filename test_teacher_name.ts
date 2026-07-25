const currentUser = {
    id: "test",
    user_id: "test",
    first_name: "Vickie",
    last_name: "Huang",
    email: "test@test.com",
    user_name: "Vickie Huang",
    role: "teacher"
};

const teacherName = currentUser
    ? (typeof currentUser === 'string' ? currentUser : (currentUser as any).name || (currentUser as any).user_name || 'Teacher')
    : 'Teacher';

console.log(teacherName);
