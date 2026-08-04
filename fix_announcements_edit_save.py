import re

with open('src/pages/Announcements.tsx', 'r') as f:
    content = f.read()

replacement = """      if (attachments && attachments.length > 0) {
          encodedContent += `\\n\\n---ATTACHMENTS---\\n${JSON.stringify(attachments)}`;
      }
      await supabase.from('announcements').update({ 
          title: editAnnTitleStr, 
          content: encodedContent,
          target_role_ids: editAudienceMode === 'roles' ? editTargetRoleIds : [],
          target_class_ids: editAudienceMode === 'classes' ? editTargetClassIds : [],
          target_user_ids: editAudienceMode === 'users' ? editTargetUserIds : [],
          target_role_id: null
      }).eq('announcement_id', annId);"""

content = content.replace(
"""      if (attachments && attachments.length > 0) {
          encodedContent += `\\n\\n---ATTACHMENTS---\\n${JSON.stringify(attachments)}`;
      }
      await supabase.from('announcements').update({ title: editAnnTitleStr, content: encodedContent }).eq('announcement_id', annId);""",
replacement
)

with open('src/pages/Announcements.tsx', 'w') as f:
    f.write(content)
