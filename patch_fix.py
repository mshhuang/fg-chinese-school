import re

with open('src/pages/TeacherDashboard.tsx', 'r') as f:
    content = f.read()

# Replace the broken chunk with the correct HTML
broken_pattern = r"""                              </span.*?\n.*?<span className="w-1\.5 h-1\.5 rounded-full bg-outline-variant/50"></span>.*?\n.*?<span className="font-label text-sm text-on-surface-variant opacity-80">\{title\}</span>.*?\n.*?</div>.*?\n.*?\);.*?\n.*?\}"""

replacement = """                              </span>
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
         </aside>
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
}"""

content = re.sub(broken_pattern, replacement, content, flags=re.DOTALL)

with open('src/pages/TeacherDashboard.tsx', 'w') as f:
    f.write(content)
