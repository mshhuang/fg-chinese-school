import re

with open('src/pages/Announcements.tsx', 'r') as f:
    content = f.read()

target = """  const handleEditAnnouncementSub = async (annId: string, authorRole: string) => {
      if (!editAnnContentStr.trim()) return;
      // Always use the explicitly selected posting role if available, otherwise fallback to the current authorRole
      const finalRole = selectedPostingRole || authorRole;
      const encodedContent = `$$_role:${finalRole}_$$${editAnnContentStr}`;
      await supabase.from('announcements').update({ title: editAnnTitleStr, content: encodedContent }).eq('announcement_id', annId);"""

replacement = """  const handleEditAnnouncementSub = async (annId: string, authorRole: string, isSystem: boolean, attachments: any[]) => {
      if (!editAnnContentStr.trim()) return;
      let encodedContent = editAnnContentStr;
      if (isSystem) {
          encodedContent = `$$_is_system:true_$$${editAnnContentStr}`;
      } else {
          const finalRole = selectedPostingRole || authorRole;
          encodedContent = `$$_role:${finalRole}_$$${editAnnContentStr}`;
      }
      if (attachments && attachments.length > 0) {
          encodedContent += `\\n\\n---ATTACHMENTS---\\n${JSON.stringify(attachments)}`;
      }
      await supabase.from('announcements').update({ title: editAnnTitleStr, content: encodedContent }).eq('announcement_id', annId);"""

content = content.replace(target, replacement)

target2 = """<button onClick={() => { handleEditAnnouncementSub(ann.announcement_id, authorRole); setSelectedPostingRole(""); }} className="bg-primary text-on-primary px-5 py-2 rounded-full font-label font-bold text-sm">Save</button>"""
replacement2 = """<button onClick={() => { handleEditAnnouncementSub(ann.announcement_id, authorRole, isSystem, attachments); setSelectedPostingRole(""); }} className="bg-primary text-on-primary px-5 py-2 rounded-full font-label font-bold text-sm">Save</button>"""

content = content.replace(target2, replacement2)

with open('src/pages/Announcements.tsx', 'w') as f:
    f.write(content)
