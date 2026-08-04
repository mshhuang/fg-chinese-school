import re

with open('src/pages/Announcements.tsx', 'r') as f:
    content = f.read()

replacement = """                                                setEditingAnnId(ann.announcement_id); 
                                                setEditAnnTitleStr(ann.title); 
                                                setEditAnnContentStr(displayContent);
                                                
                                                if (ann.target_role_ids?.length > 0 || ann.target_role_id) {
                                                    setEditAudienceMode('roles');
                                                    setEditTargetRoleIds(ann.target_role_ids?.length ? ann.target_role_ids : [ann.target_role_id].filter(Boolean));
                                                    setEditTargetClassIds([]);
                                                    setEditTargetUserIds([]);
                                                } else if (ann.target_class_ids?.length > 0) {
                                                    setEditAudienceMode('classes');
                                                    setEditTargetClassIds(ann.target_class_ids);
                                                    setEditTargetRoleIds([]);
                                                    setEditTargetUserIds([]);
                                                } else if (ann.target_user_ids?.length > 0) {
                                                    setEditAudienceMode('users');
                                                    setEditTargetUserIds(ann.target_user_ids);
                                                    setEditTargetRoleIds([]);
                                                    setEditTargetClassIds([]);
                                                } else {
                                                    setEditAudienceMode('all');
                                                    setEditTargetRoleIds([]);
                                                    setEditTargetClassIds([]);
                                                    setEditTargetUserIds([]);
                                                }
"""

content = content.replace(
"""                                                setEditingAnnId(ann.announcement_id); 
                                                setEditAnnTitleStr(ann.title); 
                                                setEditAnnContentStr(displayContent);""",
replacement
)

with open('src/pages/Announcements.tsx', 'w') as f:
    f.write(content)
