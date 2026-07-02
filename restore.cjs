const fs = require('fs');

const missingBlock = `                                                                <textarea 
                                                                    className="w-full px-3 py-2 bg-surface rounded-xl border border-outline-variant/50 focus:border-primary font-body text-sm min-h-[80px] outline-none"
                                                                    value={editReplyContentStr} onChange={(e) => setEditReplyContentStr(e.target.value)}
                                                                 />
                                                                 <div className="flex gap-2 justify-end">
                                                                     <button onClick={() => setEditingReplyId(null)} className="px-3 py-1.5 rounded-full font-label text-[10px] uppercase tracking-wider font-bold hover:bg-surface-variant">Cancel</button>
                                                                     <button onClick={() => handleEditReplySub(r.reply_id)} className="bg-primary text-on-primary px-4 py-1.5 rounded-full font-label text-[10px] uppercase tracking-wider font-bold">Save</button>
                                                                 </div>
                                                             </div>
                                                        ) : (
                                                            <p className="text-on-surface-variant leading-snug">{r.content}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {user?.id && (
                                    <div className="flex gap-3 items-center mt-1">
                                         <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                                            {getRoleIcon(user?.role || "student", "w-5 h-5")}
                                        </div>
                                        <div className="flex-1 relative">
                                            <input 
                                                type="text" 
                                                className="w-full pl-5 pr-12 py-3 bg-surface rounded-full border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body text-sm transition-all shadow-sm"
                                                placeholder="Add class comment..."
                                                value={replyBody[ann.announcement_id] || ""}
                                                onChange={(e) => setReplyBody(p => ({...p, [ann.announcement_id]: e.target.value}))}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleReplySubmit(ann.announcement_id);
                                                }}
                                            />
                                            <button 
                                                onClick={() => handleReplySubmit(ann.announcement_id)}
                                                disabled={isReplying[ann.announcement_id] || !replyBody[ann.announcement_id]?.trim()}
                                                className="absolute right-1.5 top-1.5 p-2 rounded-full text-primary hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                                            >
                                                {isReplying[ann.announcement_id] ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                )}
                          </div>
                      </div>
                  )
              })}

              {filteredAnnouncements.length === 0 && (
                 <div className="flex flex-col items-center justify-center p-12 bg-surface-container-low border border-dashed border-outline-variant/40 rounded-3xl mt-4">
                    <Megaphone className="w-12 h-12 text-on-surface-variant opacity-50 mb-4" />
                    <p className="font-body text-lg text-on-surface font-medium">No announcements found</p>
                 </div>
              )}
           </div>
       )}

       {/* Compose Dialog */}
       {showCompose && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
               <div className="bg-surface-container-lowest w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                   <div className="px-6 py-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface shrink-0">
                       <h2 className="font-title text-xl font-bold text-on-surface flex items-center gap-2"><Plus className="w-5 h-5 text-primary"/> Compose Announcement</h2>
                       <button onClick={() => setShowCompose(false)} className="p-2 text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors"><X className="w-5 h-5" /></button>
                   </div>
                   <form onSubmit={handleCreateAnnouncement} className="p-6 flex flex-col gap-6 overflow-y-auto flex-1">
                       {(user?.availableRoles?.length > 1) && (
                           <div>
                               <label className="block font-label text-sm uppercase tracking-wider font-bold text-on-surface-variant mb-3 flex items-center justify-between">
                                 <span>Post As Role</span>
                                 <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full normal-case">Multiple Roles Detected</span>
                               </label>
                               <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                                   {user.availableRoles.map((r: string) => (
                                       <button
                                           key={r}
                                           type="button"
                                           onClick={() => setSelectedPostingRole(r)}
                                           className={cn(
                                               "flex items-center gap-2 px-4 py-2 rounded-xl transition-all border shrink-0",
                                               selectedPostingRole === r 
                                                 ? "bg-primary text-on-primary border-primary shadow-sm" 
                                                 : "bg-surface text-on-surface hover:bg-surface-variant border-outline-variant/30"
                                           )}
                                       >
                                           <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0", selectedPostingRole === r ? "bg-white/20" : "bg-primary/10 text-primary")}>
                                              {getRoleIcon(r, "w-4 h-4")}
                                           </div>
                                           <span className="font-label font-bold text-sm capitalize">{r}</span>
                                       </button>
                                   ))}
                               </div>
                           </div>
                       )}
                       <div>
                           <label className="block font-label text-sm uppercase tracking-wider font-bold text-on-surface-variant mb-3">Send to Audience</label>
                           <div className="flex flex-wrap gap-2 mb-4">
                              {['all', 'roles', 'classes', 'users'].map(mode => (
                                  <button
                                      key={mode}
                                      type="button"
                                      onClick={() => setAudienceMode(mode)}
                                      className={cn(
                                          "px-4 py-2 rounded-full font-label text-xs font-bold capitalize transition-colors border",
                                          audienceMode === mode 
                                            ? "bg-primary text-on-primary border-primary" 
                                            : "bg-surface border-outline-variant/50 text-on-surface-variant hover:bg-surface-variant"
                                      )}
                                  >
                                      {mode === 'all' ? 'Everyone' : \`Specific \${mode}\`}
                                  </button>
                              ))}
                           </div>

                           <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 text-sm max-h-48 overflow-y-auto">
                               {audienceMode === 'all' && (
                                   <p className="text-on-surface-variant">This announcement will be visible to everyone.</p>
                               )}
                               
                               {audienceMode === 'roles' && (
                                   <div className="grid grid-cols-2 gap-3">
                                       {roles.map(r => (
                                           <label key={r.role_id} className="flex items-center gap-2 cursor-pointer text-on-surface">
                                               <input 
                                                  type="checkbox" 
                                                  className="rounded border-outline-variant/50 text-primary focus:ring-primary"
                                                  checked={targetRoleIds.includes(r.role_id)}
                                                  onChange={() => toggleMultiSelect(setTargetRoleIds, r.role_id)}
                                               />
                                               {r.role_name}
                                           </label>
                                       ))}
                                   </div>
                               )}

                               {audienceMode === 'classes' && (
                                   <div className="grid grid-cols-2 gap-3">
                                       {classes.length === 0 ? <p className="text-on-surface-variant">No classes available.</p> : classes.map(c => (
                                           <label key={c.class_id} className="flex items-center gap-2 cursor-pointer text-on-surface">
                                               <input 
                                                  type="checkbox" 
                                                  className="rounded border-outline-variant/50 text-primary focus:ring-primary"
                                                  checked={targetClassIds.includes(c.class_id)}
                                                  onChange={() => toggleMultiSelect(setTargetClassIds, c.class_id)}
                                               />
                                               {c.class_name}
                                           </label>
                                       ))}
                                   </div>
                               )}

                               {audienceMode === 'users' && (
                                   <div className="flex flex-col">
                                       {(() => {
                                         const rolesList = new Set<string>();
                                         availableUsers.forEach(u => {
                                           (u.role_names || []).forEach((r: string) => rolesList.add(r));
                                         });
                                         const desiredOrder = ['Admin', 'Teacher', 'Student', 'Parent', 'Volunteer', 'Staff', 'Builder'];
                                         const sortedRoles = Array.from(rolesList).sort((a, b) => {
                                           const idxA = desiredOrder.indexOf(a);
                                           const idxB = desiredOrder.indexOf(b);
                                           if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                                           if (idxA !== -1) return -1;
                                           if (idxB !== -1) return 1;
                                           return a.localeCompare(b);
                                         });
                                         const finalRoles = [...sortedRoles, "Others"];
                                         
                                         return finalRoles.map(r => {
                                             const group = availableUsers.filter(u => {
                                               const userRoles = u.role_names || [];
                                               if (r === "Others") return userRoles.length === 0;
                                               return userRoles.includes(r);
                                             });
                                             
                                             if (group.length === 0) return null;
                                             
                                             group.sort((a, b) => (a.last_name || '').localeCompare(b.last_name || ''));
                                             
                                             const roleLabel = r === "Others" ? "Unassigned" : (r === "Admin" ? "School Admin" : (r === "Teacher" ? "Teachers" : (r === "Student" ? "Students" : (r === "Parent" ? "Parents" : r))));

                                             return (
                                                <div key={r} className="mb-4 last:mb-0">
                                                    <div className="font-label text-xs uppercase tracking-wider text-on-surface-variant font-bold mb-2 bg-surface-variant/30 px-2 py-1 rounded">
                                                        {roleLabel}
                                                    </div>
                                                    <div className="flex flex-col gap-2 pl-2">
                                                        {group.map(u => (
                                                             <label key={u.user_id} className="flex items-center gap-2 cursor-pointer text-on-surface border-b border-outline-variant/10 pb-2 last:border-0 last:pb-0">
                                                                <input 
                                                                   type="checkbox" 
                                                                   className="rounded border-outline-variant/50 text-primary focus:ring-primary"
                                                                   checked={targetUserIds.includes(u.user_id)}
                                                                   onChange={() => toggleMultiSelect(setTargetUserIds, u.user_id)}
                                                                />
                                                                <span className="font-bold">{u.first_name} {u.last_name}</span> 
                                                                <span className="text-xs text-on-surface-variant">({u.email})</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                             );
                                         });
                                       })()}
                                   </div>
                               )}
                           </div>
                       </div>
                       
                       <div>
                           <label className="block font-label text-sm uppercase tracking-wider font-bold text-on-surface-variant mb-2">Announcement Title</label>
                           <input 
                               type="text" 
                               required
                               value={composeTitle} 
                               onChange={(e) => setComposeTitle(e.target.value)}
                               className="w-full px-4 py-3 bg-surface border border-outline-variant/50 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body text-base"
                               placeholder="e.g., Important Schedule Update"
                           />
                       </div>
                       <div className="flex-1 flex flex-col">
                           <label className="block font-label text-sm uppercase tracking-wider font-bold text-on-surface-variant mb-2">Message</label>
                           <div className="bg-surface rounded-xl border border-outline-variant/50 overflow-hidden">
                               <ReactQuill 
                                 theme="snow"
                                 value={composeContent} 
                                 onChange={setComposeContent}
                                 modules={modules}
                                 className="h-48 pb-10"
                               />
                           </div>
                       </div>`;

let content = fs.readFileSync('src/pages/Announcements.tsx', 'utf8');

// Replace the corrupted block
content = content.replace(
    /<div className="bg-surface rounded-xl border border-outline-variant\/50 overflow-hidden">\s*<ReactQuill \s*theme="snow"\s*value={composeContent} \s*onChange={setComposeContent}\s*modules={modules}\s*className="h-48 pb-10"\s*\/>\s*<\/div>\s*<\/div>/g,
    missingBlock
);

fs.writeFileSync('src/pages/Announcements.tsx', content);
