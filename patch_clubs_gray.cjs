const fs = require('fs');
let code = fs.readFileSync('src/components/layout/MainLayout.tsx', 'utf8');

code = code.replace(
  '{ icon: Users, label: "Clubs", href: "/student/clubs" }',
  '{ icon: Users, label: "Clubs", href: "/student/clubs", disabled: true }'
);

const desktopMapCode = `{currentRole.nav.map((item: any, idx: number) => (
                <NavLink key={idx} to={item.href} className={({isActive}) => cn("flex items-center justify-between px-4 py-3 rounded-full text-sm font-label font-bold transition-all", isActive ? "bg-secondary-container text-on-secondary-container" : "text-on-surface hover:bg-surface-variant/50")}>
                    <div className="flex items-center gap-3">
                       <item.icon className="w-5 h-5" />
                       {item.label}
                    </div>
                    {item.label === 'Messages' && unreadMessagesCount > 0 && (
                       <span className="flex w-2.5 h-2.5 relative shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full w-2.5 h-2.5 bg-primary"></span>
                       </span>
                    )}
                </NavLink>
            ))}`;

const mobileMapCode = `{currentRole.nav.map((item: any, idx: number) => (
                      <NavLink key={idx} onClick={() => setIsMobileMenuOpen(false)} to={item.href} className={({isActive}) => cn("flex items-center justify-between px-4 py-3 rounded-full text-sm font-label font-bold transition-all", isActive ? "bg-secondary-container text-on-secondary-container" : "text-on-surface hover:bg-surface-variant/50")}>
                          <div className="flex items-center gap-3">
                             <item.icon className="w-5 h-5" />
                             {item.label}
                          </div>
                          {item.label === 'Messages' && unreadMessagesCount > 0 && (
                             <span className="flex w-2.5 h-2.5 relative shrink-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full w-2.5 h-2.5 bg-primary"></span>
                             </span>
                          )}
                      </NavLink>
                  ))}`;

const newDesktopMapCode = `{currentRole.nav.map((item: any, idx: number) => {
                if (item.disabled) {
                    return (
                        <div key={idx} className="flex items-center justify-between px-4 py-3 rounded-full text-sm font-label font-bold transition-all text-on-surface-variant/50 cursor-not-allowed">
                            <div className="flex items-center gap-3">
                               <item.icon className="w-5 h-5 opacity-50" />
                               {item.label}
                            </div>
                        </div>
                    );
                }
                return (
                <NavLink key={idx} to={item.href} className={({isActive}) => cn("flex items-center justify-between px-4 py-3 rounded-full text-sm font-label font-bold transition-all", isActive ? "bg-secondary-container text-on-secondary-container" : "text-on-surface hover:bg-surface-variant/50")}>
                    <div className="flex items-center gap-3">
                       <item.icon className="w-5 h-5" />
                       {item.label}
                    </div>
                    {item.label === 'Messages' && unreadMessagesCount > 0 && (
                       <span className="flex w-2.5 h-2.5 relative shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full w-2.5 h-2.5 bg-primary"></span>
                       </span>
                    )}
                </NavLink>
                );
            })}`;

const newMobileMapCode = `{currentRole.nav.map((item: any, idx: number) => {
                      if (item.disabled) {
                          return (
                              <div key={idx} className="flex items-center justify-between px-4 py-3 rounded-full text-sm font-label font-bold transition-all text-on-surface-variant/50 cursor-not-allowed">
                                  <div className="flex items-center gap-3">
                                     <item.icon className="w-5 h-5 opacity-50" />
                                     {item.label}
                                  </div>
                              </div>
                          );
                      }
                      return (
                      <NavLink key={idx} onClick={() => setIsMobileMenuOpen(false)} to={item.href} className={({isActive}) => cn("flex items-center justify-between px-4 py-3 rounded-full text-sm font-label font-bold transition-all", isActive ? "bg-secondary-container text-on-secondary-container" : "text-on-surface hover:bg-surface-variant/50")}>
                          <div className="flex items-center gap-3">
                             <item.icon className="w-5 h-5" />
                             {item.label}
                          </div>
                          {item.label === 'Messages' && unreadMessagesCount > 0 && (
                             <span className="flex w-2.5 h-2.5 relative shrink-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full w-2.5 h-2.5 bg-primary"></span>
                             </span>
                          )}
                      </NavLink>
                      );
                  })}`;

code = code.replace(desktopMapCode, newDesktopMapCode);
code = code.replace(mobileMapCode, newMobileMapCode);

fs.writeFileSync('src/components/layout/MainLayout.tsx', code);
