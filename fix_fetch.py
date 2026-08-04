with open('src/lib/announcementUtils.ts', 'r') as f:
    content = f.read()

# We need to insert the orConditions logic right before annsPromise

new_logic = """
     let orString = '';
     if (userRole !== 'admin' && userRole !== 'principal' && userRole !== 'builder') {
         const orConditions: string[] = [];
         orConditions.push(`created_by.eq.${realUserId}`);
         
         const userRoleId = rolesData?.find(r => r.role_name?.toLowerCase() === userRole.toLowerCase())?.role_id;
         if (userRoleId) {
             orConditions.push(`target_role_ids.cs.{${userRoleId}}`);
             orConditions.push(`target_role_id.eq.${userRoleId}`);
         }
         
         orConditions.push(`target_user_ids.cs.{${realUserId}}`);
         
         if (userClassIds && userClassIds.length > 0) {
             const classIdsStr = userClassIds.join(',');
             orConditions.push(`target_class_ids.ov.{${classIdsStr}}`);
         }
         
         orConditions.push(`and(target_role_id.is.null,target_role_ids.eq.{},target_class_ids.eq.{},target_user_ids.eq.{})`);
         
         orString = orConditions.join(',');
     }
"""

# BUT wait! rolesData and userClassIds are fetched in Promise.all AFTER annsPromise!
# So we can't use them BEFORE annsPromise unless we split the Promise.all!
