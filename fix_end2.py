import re

with open('src/pages/TeacherDashboard.tsx', 'r') as f:
    content = f.read()

pattern = r"<h3 className=\"font-title text-xl text-on-surface flex items-center gap-3 font-bold\">\s*<BookOpen className=\"text-primary w-6 h-6\" />\s*Assigned Programs\s*</h3>.*"

replacement = """<h3 className="font-title text-xl text-on-surface flex items-center gap-3 font-bold">
                  <BookOpen className="text-primary w-6 h-6" />
                  Assigned Programs
               </h3>
               <div className="flex flex-col gap-3">
                  {assignedClasses.length > 0 ? assignedClasses.map(cls => (
                     <div key={cls.class_id} className="flex flex-col gap-2 p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
                        <div className="flex items-center justify-between">
                           <div>
                              <h4 className="font-label font-bold text-on-surface">{cls.class_name || cls.name || 'Unnamed Class'}</h4>
                              <p className="font-caption text-xs text-on-surface-variant mt-1">{cls.programs?.program_name || 'No program'}</p>
                           </div>
                           <span className={cn(
                              "px-3 py-1 rounded-full font-label text-xs font-bold whitespace-nowrap",
                              cls.primary_teacher_id === (user?.user_id || user?.id) 
                                 ? "bg-primary-container/20 text-primary" 
                                 : "bg-secondary-container/20 text-secondary"
                           )}>
                              {cls.primary_teacher_id === (user?.user_id || user?.id) ? "Homeroom Teacher" : "Co-Teacher"}
                           </span>
                        </div>
                        <div className="flex flex-wrap gap-4 mt-2 pt-2 border-t border-outline-variant/20">
                           <div className="text-xs">
                              <span className="font-bold text-on-surface-variant">Homeroom: </span>
                              <span className="text-on-surface">{formatTeacherName(cls.users?.first_name, cls.users?.last_name, 'Teacher')}</span>
                           </div>
                           <div className="text-xs">
                              <span className="font-bold text-on-surface-variant">Co-Teacher: </span>
                              <span className="text-on-surface">
                                 {(() => {
                                 const currentUserId = user?.user_id || user?.id;
                                 const allCoTeachers = [
                                    ...(cls.co_teacher_id && !(cls.co_teachers || []).includes(cls.co_teacher_id) ? [cls.co_teacher_id] : []),
                                    ...(cls.co_teachers || [])
                                 ];
                                 if (allCoTeachers.length === 0) return 'TBD';
                                 
                                 return allCoTeachers.map(id => {
                                    if (id === currentUserId) return `You (${formatTeacherName(user?.first_name, user?.last_name, 'Teacher')})`;
                                    const u = usersMap[id];
                                    if (!u) return 'Unknown';
                                    if (u.isVolunteer) return `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Volunteer';
                                    return formatTeacherName(u.first_name, u.last_name, 'Teacher');
                                 }).join(', ');
                               })()}
                              </span>
                           </div>
                        </div>
                     </div>
                  )) : (
                     <p className="text-sm text-on-surface-variant italic">No classes assigned yet.</p>
                  )}
               </div>
            </div>
            
            <div className="bg-surface rounded-2xl p-6 shadow-sm border border-outline-variant/30">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-secondary-container/30 flex items-center justify-center text-secondary">
                     <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                     <h3 className="font-title font-bold text-on-surface">Recent Announcements</h3>
                     <p className="font-caption text-xs text-on-surface-variant">Updates from administration</p>
                  </div>
               </div>
               <div className="flex flex-col gap-4">
                  {recentAnnouncements.length > 0 ? recentAnnouncements.map((ann: any, idx: number) => (
                     <div key={idx} className="flex gap-4 pb-4 border-b border-outline-variant/30 last:border-0 last:pb-0">
                        <div className="shrink-0 w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center font-bold text-sm text-on-surface-variant">
                           {ann.users?.first_name?.[0] || 'A'}
                        </div>
                        <div>
                           <h4 className="font-label font-bold text-on-surface">{ann.title}</h4>
                           <p className="font-body text-sm text-on-surface-variant mt-1 line-clamp-2">{extractPlainText(ann.content)}</p>
                           <p className="font-caption text-xs text-on-surface-variant mt-2">{new Date(ann.created_at).toLocaleDateString()}</p>
                        </div>
                     </div>
                  )) : (
                     <p className="text-sm text-on-surface-variant italic">No recent announcements.</p>
                  )}
                  <button onClick={() => navigate('/announcements')} className="mt-2 text-sm font-label font-bold text-primary hover:text-primary/80 transition-colors w-max">
                     View All Announcements
                  </button>
               </div>
            </div>
         </div>
       </div>
    </div>
  );
}

function ScheduleItem({ time, end, title, location, current }: any) {
  return (
    <div className={cn(
      "flex gap-4 p-4 rounded-2xl border transition-all",
      current 
        ? "bg-primary-container/10 border-primary-container shadow-sm" 
        : "bg-surface border-transparent hover:border-outline-variant/50"
    )}>
       <div className="shrink-0 w-20 flex flex-col items-end gap-1">
         <span className={cn("font-label text-sm font-bold", current ? "text-primary" : "text-on-surface")}>{time}</span>
         <span className="font-caption text-xs text-on-surface-variant">{end}</span>
       </div>
       
       <div className={cn("w-1 rounded-full", current ? "bg-primary" : "bg-surface-variant")}></div>
       
       <div className="flex-1 flex flex-col justify-center">
         <h4 className={cn("font-label font-bold text-base", current ? "text-on-surface" : "text-on-surface-variant")}>{title}</h4>
         <p className="font-caption text-sm text-on-surface-variant mt-1">{location}</p>
       </div>
    </div>
  );
}

function SubmissionItem({ title, status, date }: any) {
  const getStatusColor = () => {
    switch(status) {
      case 'pending': return 'bg-tertiary-container/30 text-tertiary';
      case 'approved': return 'bg-secondary-container/30 text-secondary';
      case 'changes': return 'bg-error-container/30 text-error';
      default: return 'bg-surface-variant text-on-surface-variant';
    }
  };
  
  const getStatusLabel = () => {
    switch(status) {
      case 'pending': return 'Pending Review';
      case 'approved': return 'Approved';
      case 'changes': return 'Needs Changes';
      default: return status;
    }
  };

  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 hover:border-outline-variant/50 transition-colors">
       <div className="flex justify-between items-start gap-4">
         <h4 className="font-label text-sm font-bold text-on-surface line-clamp-1">{title}</h4>
         <span className={cn("font-caption text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm font-bold shrink-0", getStatusColor())}>
           {getStatusLabel()}
         </span>
       </div>
       <span className="font-caption text-xs text-on-surface-variant">{date}</span>
    </div>
  );
}
"""

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('src/pages/TeacherDashboard.tsx', 'w') as f:
    f.write(content)
