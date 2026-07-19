import re
import os

def replace_delete(filepath):
    if not os.path.exists(filepath):
        return

    with open(filepath, 'r') as f:
        content = f.read()

    # We will just replace the whole handleDelete block.
    target = r"  async function handleDelete\(id: string\) \{.*?catch \(err: any\) \{\n      alert\(\"Error deleting user: \" \+ err.message\);\n    \}\n  \}"
    
    if "AdminUsers.tsx" in filepath:
        replacement = """  async function handleDelete(id: string) {
    if (!confirm("Are you sure? This will delete all associated records (enrollments, messages, logs, etc) and cannot be undone.")) return;
    
    // First fetch if the user is a teacher of any class
    const { data: classData } = await supabase.from('classes').select('class_id').or(`primary_teacher_id.eq.${id},co_teacher_id.eq.${id},co_teachers.cs.{${id}}`);
    if (classData && classData.length > 0) {
      alert("Cannot delete this user because they are assigned to a class as a primary or co-teacher. Please reassign their classes first.");
      return;
    }

    try {
      await supabase.from('enrollments').delete().eq('student_id', id);
      await supabase.from('assignment_students').delete().eq('student_id', id);
      await supabase.from('attendance').delete().eq('student_id', id);
      await supabase.from('parent_child').delete().eq('parent_id', id);
      await supabase.from('parent_child').delete().eq('child_id', id);
      await supabase.from('student_clock_ins').delete().eq('student_id', id);
      await supabase.from('staff_clock_ins').delete().eq('user_id', id);
      await supabase.from('internal_messages').delete().eq('sender_id', id);
      await supabase.from('internal_messages').delete().eq('recipient_id', id);
      await supabase.from('newsletters').delete().eq('author_id', id);
      await supabase.from('announcements').delete().eq('author_id', id);
      await supabase.from('announcements').delete().eq('created_by', id);
      await supabase.from('announcement_replies').delete().eq('author_id', id);
      await supabase.from('assignments').delete().eq('teacher_id', id);
      await supabase.from('system_logs').delete().eq('user_id', id);
      await supabase.from('error_logs').delete().eq('user_id', id);
      await supabase.from('audit_logs').delete().eq('user_id', id);
      await supabase.from('user_sessions').delete().eq('user_id', id);
      await supabase.from('user_roles').delete().eq('user_id', id);

      const userToDel = users.find((u: any) => u.user_id === id);
      const { error } = await supabase.from('users').delete().eq('user_id', id);
      if (error) throw error;

      if (userToDel) {
         logSystemActivity(
           "Admin Users",
           "/admin/users",
           `Deleted user ${userToDel.first_name} ${userToDel.last_name}`,
           "delete",
           { user_id: id }
         );
      }
      fetchUsers();
    } catch (err: any) {
      alert("Error deleting user: " + err.message);
    }
  }"""
    else:
        replacement = """  async function handleDelete(id: string) {
    if (!confirm("Are you sure? This will delete all associated records (enrollments, messages, logs, etc) and cannot be undone.")) return;
    
    // First fetch if the user is a teacher of any class
    const { data: classData } = await supabase.from('classes').select('class_id').or(`primary_teacher_id.eq.${id},co_teacher_id.eq.${id},co_teachers.cs.{${id}}`);
    if (classData && classData.length > 0) {
      alert("Cannot delete this user because they are assigned to a class as a primary or co-teacher. Please reassign their classes first.");
      return;
    }

    try {
      await supabase.from('enrollments').delete().eq('student_id', id);
      await supabase.from('assignment_students').delete().eq('student_id', id);
      await supabase.from('attendance').delete().eq('student_id', id);
      await supabase.from('parent_child').delete().eq('parent_id', id);
      await supabase.from('parent_child').delete().eq('child_id', id);
      await supabase.from('student_clock_ins').delete().eq('student_id', id);
      await supabase.from('staff_clock_ins').delete().eq('user_id', id);
      await supabase.from('internal_messages').delete().eq('sender_id', id);
      await supabase.from('internal_messages').delete().eq('recipient_id', id);
      await supabase.from('newsletters').delete().eq('author_id', id);
      await supabase.from('announcements').delete().eq('author_id', id);
      await supabase.from('announcements').delete().eq('created_by', id);
      await supabase.from('announcement_replies').delete().eq('author_id', id);
      await supabase.from('assignments').delete().eq('teacher_id', id);
      await supabase.from('system_logs').delete().eq('user_id', id);
      await supabase.from('error_logs').delete().eq('user_id', id);
      await supabase.from('audit_logs').delete().eq('user_id', id);
      await supabase.from('user_sessions').delete().eq('user_id', id);
      await supabase.from('user_roles').delete().eq('user_id', id);

      const { error } = await supabase.from('users').delete().eq('user_id', id);
      if (error) throw error;
      fetchUsers();
    } catch (err: any) {
      alert("Error deleting user: " + err.message);
    }
  }"""

    content = re.sub(target, replacement, content, flags=re.DOTALL)
    
    with open(filepath, 'w') as f:
        f.write(content)
    print(f"Patched {filepath}")

replace_delete('src/pages/AdminUsers.tsx')
replace_delete('src/components/admin/UserDirectoryTab.tsx')
