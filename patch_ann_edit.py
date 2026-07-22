import re
with open('src/pages/Announcements.tsx', 'r') as f:
    content = f.read()

# Modify handleEditAnnouncementSub
target_edit = """  const handleEditAnnouncementSub = async (annId: string, authorRole: string) => {
      if (!editAnnContentStr.trim()) return;
      // Always use the explicitly selected posting role if available, otherwise fallback to the current authorRole
      const finalRole = selectedPostingRole || authorRole;
      const encodedContent = `$$_role:${finalRole}_$$${editAnnContentStr}`;"""

replacement_edit = """  const handleEditAnnouncementSub = async (annId: string, authorRole: string, isSystem: boolean) => {
      if (!editAnnContentStr.trim()) return;
      // Always use the explicitly selected posting role if available, otherwise fallback to the current authorRole
      let encodedContent = editAnnContentStr;
      if (isSystem) {
          encodedContent = `$$_is_system:true_$$${editAnnContentStr}`;
      } else {
          const finalRole = selectedPostingRole || authorRole;
          encodedContent = `$$_role:${finalRole}_$$${editAnnContentStr}`;
      }"""
content = content.replace(target_edit, replacement_edit)

target_edit_call = """<button onClick={() => { handleEditAnnouncementSub(ann.announcement_id, authorRole); setSelectedPostingRole(""); }} className="bg-primary text-on-primary px-5 py-2 rounded-full font-label font-bold text-sm">Save</button>"""
replacement_edit_call = """<button onClick={() => { handleEditAnnouncementSub(ann.announcement_id, authorRole, isSystem); setSelectedPostingRole(""); }} className="bg-primary text-on-primary px-5 py-2 rounded-full font-label font-bold text-sm">Save</button>"""
content = content.replace(target_edit_call, replacement_edit_call)

with open('src/pages/Announcements.tsx', 'w') as f:
    f.write(content)
