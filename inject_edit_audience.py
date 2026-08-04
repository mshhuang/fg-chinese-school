import re

with open('src/pages/Announcements.tsx', 'r') as f:
    content = f.read()

edit_audience_ui = """
                                     <div className="mt-4">
                                         <label className="block font-label text-sm uppercase tracking-wider font-bold text-on-surface-variant mb-3">Change Audience</label>
                                         <div className="flex flex-wrap gap-2 mb-4">
                                            {['all', 'roles', 'classes', 'users'].map(mode => (
                                                <button
                                                    key={mode}
                                                    type="button"
                                                    onClick={() => setEditAudienceMode(mode)}
                                                    className={cn(
                                                        "px-4 py-2 rounded-full font-label text-xs font-bold capitalize transition-colors border",
                                                        editAudienceMode === mode
                                                           ? "bg-primary text-on-primary border-primary"
                                                           : "bg-surface border-outline-variant/50 text-on-surface-variant hover:bg-surface-variant"
                                                    )}
                                                >
                                                    {mode === 'all' ? t('Everyone') : t('Specific ' + mode)}
                                                </button>
                                            ))}
                                         </div>
                                         <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 text-sm max-h-48 overflow-y-auto">
                                             {editAudienceMode === 'all' && (
                                                 <p className="text-on-surface-variant">This announcement will be visible to everyone.</p>
                                             )}
                                             
                                             {editAudienceMode === 'roles' && (
                                                 <div className="grid grid-cols-2 gap-3">
                                                     {roles.map(r => (
                                                         <label key={r.role_id} className="flex items-center gap-2 cursor-pointer text-on-surface">
                                                             <input
                                                                 type="checkbox"
                                                                 className="rounded border-outline-variant/50 text-primary focus:ring-primary"
                                                                checked={editTargetRoleIds.includes(r.role_id)}
                                                                onChange={() => toggleMultiSelect(setEditTargetRoleIds, r.role_id)}
                                                             />
                                                             {r.role_name}
                                                         </label>
                                                     ))}
                                                 </div>
                                             )}
                                             {editAudienceMode === 'classes' && (
                                                 <div className="grid grid-cols-2 gap-3">
                                                     {classes.length === 0 ? <p className="text-on-surface-variant">No classes available.</p> : classes.map(c => (
                                                         <label key={c.class_id} className="flex items-center gap-2 cursor-pointer text-on-surface">
                                                             <input
                                                                 type="checkbox"
                                                                 className="rounded border-outline-variant/50 text-primary focus:ring-primary"
                                                                checked={editTargetClassIds.includes(c.class_id)}
                                                                onChange={() => toggleMultiSelect(setEditTargetClassIds, c.class_id)}
                                                             />
                                                             {c.class_name}
                                                         </label>
                                                     ))}
                                                 </div>
                                             )}
                                             {editAudienceMode === 'users' && (
                                                 <div className="flex flex-col gap-3">
                                                     <div className="relative">
                                                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50" />
                                                         <input 
                                                             type="text" 
                                                             placeholder="Search users to tag..."
                                                             value={editUserSearchQuery}
                                                             onChange={(e) => setEditUserSearchQuery(e.target.value)}
                                                             className="w-full pl-9 pr-4 py-2 bg-surface rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body text-sm"
                                                         />
                                                     </div>
                                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                         {availableUsers
                                                             .filter(u => `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(editUserSearchQuery.toLowerCase()))
                                                             .slice(0, 10)
                                                             .map(u => {
                                                                 const isSelected = editTargetUserIds.includes(u.user_id);
                                                                 const getPrimaryRole = (roles: string[]) => {
                                                                     if (!roles || roles.length === 0) return 'Others';
                                                                     const priority = ['Admin', 'Principal', 'Teacher', 'Staff', 'Parent', 'Student'];
                                                                     let bestIdx = 999;
                                                                     for (const r of roles) {
                                                                         const idx = priority.indexOf(r);
                                                                         if (idx !== -1 && idx < bestIdx) bestIdx = idx;
                                                                     }
                                                                     if (bestIdx === 999) return roles[0];
                                                                     return priority[bestIdx];
                                                                 };
                                                                 return (
                                                                     <div 
                                                                         key={u.user_id} 
                                                                         onClick={() => toggleMultiSelect(setEditTargetUserIds, u.user_id)}
                                                                         className={cn(
                                                                             "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors",
                                                                             isSelected ? "bg-primary/10 border-primary shadow-sm" : "bg-surface border-outline-variant/50 hover:bg-surface-variant"
                                                                         )}
                                                                     >
                                                                         <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center shrink-0">
                                                                             <UserSquare2 className="w-4 h-4 text-on-surface-variant" />
                                                                         </div>
                                                                         <div className="flex-1 min-w-0">
                                                                             <p className="font-title text-sm font-bold text-on-surface truncate">{u.first_name} {u.last_name}</p>
                                                                             <p className="text-xs text-on-surface-variant truncate">{getPrimaryRole(u.role_names)} • {u.email}</p>
                                                                         </div>
                                                                         <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0", isSelected ? "bg-primary border-primary text-on-primary" : "border-outline-variant/50")}>
                                                                             {isSelected && <Check className="w-3 h-3" />}
                                                                         </div>
                                                                     </div>
                                                                 );
                                                             })}
                                                     </div>
                                                 </div>
                                             )}
                                         </div>
                                     </div>
"""

content = content.replace(
    '                                     <div className="flex gap-2 justify-end mt-2">',
    edit_audience_ui + '\n                                     <div className="flex gap-2 justify-end mt-4">'
)

with open('src/pages/Announcements.tsx', 'w') as f:
    f.write(content)

