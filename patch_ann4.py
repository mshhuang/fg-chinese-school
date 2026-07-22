import re

with open('src/pages/Announcements.tsx', 'r') as f:
    content = f.read()

# 1. Add state
old_content = content
content = content.replace(
    'const [composeAttachments, setComposeAttachments] = useState<{name: string, url: string}[]>([]);',
    'const [composeAttachments, setComposeAttachments] = useState<{name: string, url: string}[]>([]);\n  const [isSystemAnnouncement, setIsSystemAnnouncement] = useState(false);'
)
print("1 applied:", content != old_content)

# 2. Add isSystemAnnouncement encoding
old_content = content
content = content.replace(
    'let encodedContent = selectedPostingRole ? `$$_role:${selectedPostingRole}_$$${composeContent}` : composeContent;',
    'let encodedContent = isSystemAnnouncement ? `$$_is_system:true_$$${composeContent}` : (selectedPostingRole ? `$$_role:${selectedPostingRole}_$$${composeContent}` : composeContent);'
)
print("2 applied:", content != old_content)

# 3. Add state reset
old_content = content
content = content.replace(
    'setComposeAttachments([]);',
    'setComposeAttachments([]);\n       setIsSystemAnnouncement(false);'
)
print("3 applied:", content != old_content)

# 4. Parse displayContent
target_parse = """                  let authorRole = getPrimaryRole(ann.users);
                  
                  // Match $$_role: Role_$$ Content... or slightly malformed variants"""

replacement_parse = """                  let authorRole = getPrimaryRole(ann.users);
                  let isSystem = false;
                  if (displayContent.includes('$$_is_system:true_$$')) {
                      isSystem = true;
                      authorRole = "System";
                      displayContent = displayContent.replace('$$_is_system:true_$$', '');
                  }
                  
                  // Match $$_role: Role_$$ Content... or slightly malformed variants"""
old_content = content
content = content.replace(target_parse, replacement_parse)
print("4 applied:", content != old_content)


# 5. Render authorName
target_authorName = """                  const authorName = ann.users ? (isTeacher ? formatTeacherName(ann.users.first_name, ann.users.last_name) : `${ann.users.first_name} ${ann.users.last_name}`) : "System / Unknown";"""
replacement_authorName = """                  const authorName = isSystem ? "System Announcement" : (ann.users ? (isTeacher ? formatTeacherName(ann.users.first_name, ann.users.last_name) : `${ann.users.first_name} ${ann.users.last_name}`) : "System / Unknown");"""
old_content = content
content = content.replace(target_authorName, replacement_authorName)
print("5 applied:", content != old_content)


# 6. Add UI for checkbox in Compose Modal
target_ui = """                       {(user?.availableRoles?.length > 1) && ("""
replacement_ui = """                       {(user?.role === 'builder' || user?.role === 'admin' || user?.availableRoles?.includes('builder')) && (
                           <div className="flex items-center gap-2 mb-4">
                               <input
                                   type="checkbox"
                                   id="isSystemAnnouncement"
                                   checked={isSystemAnnouncement}
                                   onChange={e => setIsSystemAnnouncement(e.target.checked)}
                                   className="rounded border-outline-variant/50 text-primary focus:ring-primary w-4 h-4"
                               />
                               <label htmlFor="isSystemAnnouncement" className="font-label text-sm font-bold text-on-surface cursor-pointer">
                                   Post as System Announcement (No Name)
                               </label>
                           </div>
                       )}
                       {(user?.availableRoles?.length > 1) && !isSystemAnnouncement && ("""
old_content = content
content = content.replace(target_ui, replacement_ui)
print("6 applied:", content != old_content)

with open('src/pages/Announcements.tsx', 'w') as f:
    f.write(content)
