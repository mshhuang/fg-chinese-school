import { supabase } from './supabase';

export async function fetchVisibleAnnouncements(user: any, userRole: string, limitCount?: number, fields?: string) {
   if (!user) return [];
   
   try {
     userRole = userRole || 'student';
     
     const selectQuery = fields || `
        announcement_id,
        title,
        content,
        created_at,
        created_by,
        target_role_id,
        target_role_ids,
        target_class_ids,
        target_user_ids,
        users:created_by ( first_name, last_name, email ),
        roles:target_role_id ( role_name ),
        announcement_replies (
           reply_id,
           content,
           created_at,
           user_id,
           users (
               first_name,
               last_name,
               email
           )
        )
     `;

     let anns: any[] | null = null;
     let error: any = null;

     // Try the complex join query first
     const queryPromise = supabase.from('announcements')
         .select(selectQuery)
         .order('created_at', { ascending: false })
         .limit(limitCount ? limitCount * 3 : 200);

     const { data: primaryData, error: primaryErr } = await queryPromise;

     if (!primaryErr && primaryData) {
         anns = primaryData;
     } else {
         console.warn("fetchVisibleAnnouncements join query failed:", primaryErr?.message || primaryErr);
         // Fallback to simple query if joins cause timeout
         const fallbackQuery = fields || '*';
         const { data: fallbackData, error: fallbackErr } = await supabase.from('announcements')
             .select(fallbackQuery)
             .order('created_at', { ascending: false })
             .limit(limitCount ? limitCount * 3 : 200);
             
         if (!fallbackErr && fallbackData) {
             anns = fallbackData;
         } else {
             error = fallbackErr;
         }
     }
     
     if (anns && !fields) {
         const userIds = new Set<string>();
         (anns as any[]).forEach(a => {
             if (a.created_by) userIds.add(a.created_by);
             a.announcement_replies?.forEach((r: any) => {
                 if (r.user_id) userIds.add(r.user_id);
             });
         });
         
         const uIdArray = Array.from(userIds);
         if (uIdArray.length > 0) {
             // Fetch users and roles separately for manual hydration (especially if fallback query was used)
             const [rolesRes, usersRes] = await Promise.all([
                 supabase.from('user_roles').select('user_id, roles(role_name)').in('user_id', uIdArray),
                 supabase.from('users').select('user_id, first_name, last_name, email').in('user_id', uIdArray)
             ]);

             const roleMap: Record<string, any[]> = {};
             rolesRes.data?.forEach(ur => {
                 if (!roleMap[ur.user_id]) roleMap[ur.user_id] = [];
                 roleMap[ur.user_id].push(ur);
             });
             
             const userMap: Record<string, any> = {};
             usersRes.data?.forEach(u => {
                 userMap[u.user_id] = u;
             });

             (anns as any[]).forEach(a => {
                 if (!a.users && a.created_by && userMap[a.created_by]) {
                     a.users = userMap[a.created_by];
                 }
                 if (a.users) (a.users as any).user_roles = roleMap[a.created_by] || [];
                 
                 a.announcement_replies?.forEach((r: any) => {
                     if (!r.users && r.user_id && userMap[r.user_id]) {
                         r.users = userMap[r.user_id];
                     }
                     if (r.users) (r.users as any).user_roles = roleMap[r.user_id] || [];
                 });
             });
         }
     }

     if (error) {
         console.warn("fetchVisibleAnnouncements notice:", error);
         return [];
     }
     
     let allAnns: any[] = (anns as any[]) || [];
     
     // Filter out system configuration rows stored in announcements table
     allAnns = allAnns.filter(a => a.title !== 'SYSTEM_SCHOOL_SCHEDULE_URL');

     if (userRole === 'admin' || userRole === 'principal' || userRole === 'builder') {
         return limitCount ? allAnns.slice(0, limitCount) : allAnns;
     }

     // Fetch user's role id
     const { data: rolesRes } = await supabase.from('roles').select('*');
     const userRoleId = rolesRes?.find(r => r.role_name?.toLowerCase() === userRole.toLowerCase())?.role_id;

     // Fetch user's classes
     let userClassIds: string[] = [];
        
     if (userRole === 'student') {
         const { data: enrollments } = await supabase.from('enrollments').select('class_id').eq('student_id', user.id);
         if (enrollments) userClassIds = enrollments.map(e => e.class_id);
     } else if (userRole === 'parent') {
         const { data: children } = await supabase.from('parent_child').select('child_id').eq('parent_id', user.id);
         if (children && children.length > 0) {
             const childIds = children.map(c => c.child_id);
             const { data: enrollments } = await supabase.from('enrollments').select('class_id').in('student_id', childIds);
             if (enrollments) userClassIds = enrollments.map(e => e.class_id);
         }
     } else if (userRole === 'teacher') {
         const { data: classes } = await supabase.from('classes').select('class_id').eq('primary_teacher_id', user.id);
         if (classes) userClassIds = classes.map(c => c.class_id);
     }

     const filteredAnns = allAnns.filter(a => {
         if (a.created_by === user.id) return true;
                
         const noTargets = !a.target_role_ids?.length && !a.target_class_ids?.length && !a.target_user_ids?.length && !a.target_role_id;
         if (noTargets) return true;
                
         if (userRoleId && a.target_role_ids?.includes(userRoleId)) return true;
         if (userRoleId && a.target_role_id === userRoleId) return true;
         if (a.target_user_ids?.includes(user.id)) return true;
                
         if (a.target_class_ids && a.target_class_ids.length > 0) {
             if (a.target_class_ids.some((cId: string) => userClassIds.includes(cId))) {
                 return true;
             }
         }
                
         return false;
     });

     return limitCount ? filteredAnns.slice(0, limitCount) : filteredAnns;
   } catch (e) {
     console.error("fetchVisibleAnnouncements error:", e);
     return [];
   }
}
