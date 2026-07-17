import re

with open('src/lib/announcementUtils.ts', 'r') as f:
    content = f.read()

target = """     const selectQuery = fields || `
        *,
        users:created_by ( first_name, last_name, email, user_roles ( roles ( role_name ) ) ),
        roles:target_role_id ( role_name ),
        announcement_replies (
          reply_id,
          content,
          created_at,
          users:user_id ( first_name, last_name, email, user_roles ( roles ( role_name ) ) )
        )
     `;
     const { data: anns, error } = await supabase.from('announcements').select(selectQuery).order('created_at', { ascending: false }).limit(30);"""

replacement = """     const selectQuery = fields || `
        *,
        users:created_by ( first_name, last_name, email ),
        roles:target_role_id ( role_name ),
        announcement_replies (
          reply_id,
          content,
          created_at,
          user_id,
          users:user_id ( first_name, last_name, email )
        )
     `;
     const { data: anns, error } = await supabase.from('announcements').select(selectQuery).order('created_at', { ascending: false }).limit(50);
     
     if (anns && !fields) {
         const userIds = new Set<string>();
         anns.forEach(a => {
             if (a.created_by) userIds.add(a.created_by);
             a.announcement_replies?.forEach((r: any) => {
                 if (r.user_id) userIds.add(r.user_id);
             });
         });
         
         const uIdArray = Array.from(userIds);
         if (uIdArray.length > 0) {
             const { data: uRoles } = await supabase.from('user_roles').select('user_id, roles(role_name)').in('user_id', uIdArray);
             const roleMap: Record<string, any[]> = {};
             uRoles?.forEach(ur => {
                 if (!roleMap[ur.user_id]) roleMap[ur.user_id] = [];
                 roleMap[ur.user_id].push(ur);
             });
             
             anns.forEach(a => {
                 if (a.users) (a.users as any).user_roles = roleMap[a.created_by] || [];
                 a.announcement_replies?.forEach((r: any) => {
                     if (r.users) (r.users as any).user_roles = roleMap[r.user_id] || [];
                 });
             });
         }
     }"""

if target in content:
    content = content.replace(target, replacement)
    with open('src/lib/announcementUtils.ts', 'w') as f:
        f.write(content)
    print("Patched announcementUtils.ts again")
else:
    print("Target not found!")
