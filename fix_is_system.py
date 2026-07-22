import re

with open('src/pages/Announcements.tsx', 'r') as f:
    content = f.read()

target = """                  const isTeacher = ann.users?.user_roles?.some((ur: any) => ur.roles?.role_name === 'Teacher');
                  const authorName = isSystem ? "System Announcement" : (ann.users ? (isTeacher ? formatTeacherName(ann.users.first_name, ann.users.last_name) : `${ann.users.first_name} ${ann.users.last_name}`) : "System / Unknown");
                  const audienceInfo = extractAudienceStr(ann);
                  const replies = ann.announcement_replies || [];
                  
                  let displayContent = ann.content || "";
                  let authorRole = getPrimaryRole(ann.users);
                  let isSystem = false;
                  if (displayContent.includes('$$_is_system:true_$$')) {
                      isSystem = true;
                      authorRole = "System";
                      displayContent = displayContent.replace('$$_is_system:true_$$', '');
                  }"""

replacement = """                  const isTeacher = ann.users?.user_roles?.some((ur: any) => ur.roles?.role_name === 'Teacher');
                  
                  let displayContent = ann.content || "";
                  let authorRole = getPrimaryRole(ann.users);
                  let isSystem = false;
                  if (displayContent.includes('$$_is_system:true_$$')) {
                      isSystem = true;
                      authorRole = "System";
                      displayContent = displayContent.replace('$$_is_system:true_$$', '');
                  }

                  const authorName = isSystem ? "System Announcement" : (ann.users ? (isTeacher ? formatTeacherName(ann.users.first_name, ann.users.last_name) : `${ann.users.first_name} ${ann.users.last_name}`) : "System / Unknown");
                  const audienceInfo = extractAudienceStr(ann);
                  const replies = ann.announcement_replies || [];"""

content = content.replace(target, replacement)

with open('src/pages/Announcements.tsx', 'w') as f:
    f.write(content)
