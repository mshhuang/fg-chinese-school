const fs = require('fs');
fs.writeFileSync('src/components/layout/MainLayout.tsx', `import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { 
  Building2, User, Users as ParentUsers, GraduationCap, Settings as Wrench, Pickaxe,
  LayoutDashboard, School, MessageSquare, Calendar, Users, Bell, Flower2, BookOpen, Settings, Megaphone, Newspaper, ChevronDown, Check, LogOut, Database, KeyRound, Clock, Activity, TerminalSquare, RefreshCcw, Server, ShieldAlert,
  Menu, X
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useState, useRef, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { logSystemActivity } from "../../lib/logger";
import { logSystemEvent } from "../../lib/logSystemEvent";

const ROLE_CONFIGS: Record<string, any> = {
  admin: { name: 'Emily', roleLabel: 'School Admin', badge: 'Admin', nav: [ { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" }, { icon: School, label: "Classes", href: "/admin/classes" }, { icon: BookOpen, label: "Lesson Plans", href: "/admin/plans" }, { icon: MessageSquare, label: "Messages", href: "/admin/messages" }, { icon: Megaphone, label: "Announcements", href: "/admin/announcements" }, { icon: Newspaper, label: "Newsletters", href: "/admin/newsletters" }, { icon: Settings, label: "Management", href: "/admin/management" }, { icon: User, label: "My Profile", href: "/profile" } ] },
  teacher: { name: 'Chen Jian', roleLabel: 'Teacher', badge: 'Faculty', nav: [ { icon: LayoutDashboard, label: "Dashboard", href: "/teacher/dashboard" }, { icon: School, label: "My Classes", href: "/teacher/classes" }, { icon: BookOpen, label: "Lesson Plans", href: "/teacher/lessons" }, { icon: MessageSquare, label: "Messages", href: "/teacher/messages" }, { icon: Megaphone, label: "Announcements", href: "/teacher/announcements" }, { icon: Newspaper, label: "Newsletters", href: "/teacher/newsletters" }, { icon: User, label: "My Profile", href: "/profile" } ] },
  parent: { name: 'Wei Lin', roleLabel: 'Parent', badge: 'Family', nav: [ { icon: LayoutDashboard, label: "Dashboard", href: "/parent/dashboard" }, { icon: Megaphone, label: "Announcements", href: "/parent/announcements" }, { icon: BookOpen, label: "Grades", href: "/parent/grades" }, { icon: Calendar, label: "Schedule", href: "/parent/schedule" }, { icon: MessageSquare, label: "Messages", href: "/parent/messages" }, { icon: User, label: "My Profile", href: "/profile" } ] },
  student: { name: 'Mei Lin', roleLabel: 'Student', badge: 'Grade 4', nav: [ { icon: LayoutDashboard, label: "Dashboard", href: "/student/dashboard" }, { icon: Megaphone, label: "Announcements", href: "/student/announcements" }, { icon: MessageSquare, label: "Messages", href: "/student/messages" }, { icon: User, label: "My Profile", href: "/profile" }, { icon: BookOpen, label: "Assignments", href: "/student/assignments" }, { icon: Calendar, label: "Schedule", href: "/student/schedule" }, { icon: Users, label: "Clubs", href: "/student/clubs" } ] },
  staff: { name: 'David', roleLabel: 'Staff', badge: 'Operations', nav: [ { icon: LayoutDashboard, label: "Dashboard", href: "/staff/dashboard" }, { icon: Megaphone, label: "Announcements", href: "/staff/announcements" }, { icon: User, label: "My Profile", href: "/profile" } ] },
  builder: { name: 'Vickie', roleLabel: 'Builder', badge: 'System', nav: [ { icon: LayoutDashboard, label: "Dashboard", href: "/builder/dashboard" }, { icon: Megaphone, label: "Announcements", href: "/builder/announcements" }, { icon: Users, label: "User Management", href: "/builder/users" }, { icon: Settings, label: "Settings", href: "/builder/settings" }, { icon: Clock, label: "Sessions", href: "/builder/sessions" }, { icon: Server, label: "System Logs", href: "/builder/system-logs" }, { icon: TerminalSquare, label: "Live Error Logs", href: "/builder/error-logs" }, { icon: ShieldAlert, label: "Audit Logs", href: "/builder/audit-logs" }, { icon: Activity, label: "Recent Activities", href: "/builder/activities" } ] }
};

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => {
        const currentUserStr = localStorage.getItem('user');
        if (currentUserStr) {
            try {
                const currentUser = JSON.parse(currentUserStr);
                setUserInfo(currentUser);
                setUserRole(currentUser.role);
            } catch (e) {}
        }
    };
    handler();
    window.addEventListener('storage', handler);
    window.addEventListener('ann_read_updated', handler);
    return () => {
        window.removeEventListener('storage', handler);
        window.removeEventListener('ann_read_updated', handler);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
            setIsRoleMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isUtilityRoute = location.pathname.startsWith('/profile') || location.pathname.startsWith('/change-password');
  const targetRoleKey = Object.keys(ROLE_CONFIGS).find(key => location.pathname.startsWith("/" + key));
  const pathRoleKey = targetRoleKey || (userRole === 'volunteer' ? 'staff' : (userRole || 'admin'));
  const resolvedAvailableRoles = userInfo?.availableRoles?.map((r: string) => r === 'volunteer' ? 'staff' : r) || [];
  
  const hasAccessToPathRole = isUtilityRoute || pathRoleKey === 'builder' || resolvedAvailableRoles.includes(pathRoleKey) || (userInfo && (userInfo.role === pathRoleKey || (userInfo.role === 'volunteer' && pathRoleKey === 'staff')));
  
  const currentRoleKey = isUtilityRoute ? (userRole === 'volunteer' ? 'staff' : (userRole || 'admin')) : (hasAccessToPathRole ? pathRoleKey : (userRole === 'volunteer' ? 'staff' : (userRole || 'admin')));
  const currentRole = ROLE_CONFIGS[currentRoleKey] || ROLE_CONFIGS['admin'];

  useEffect(() => {
     if (userInfo && !hasAccessToPathRole) {
        navigate("/" + (userRole === 'volunteer' ? 'staff' : userRole) + "/dashboard");
     }
  }, [userInfo, hasAccessToPathRole, navigate, userRole, location.pathname]);

  return (
    <div className="flex h-screen w-full bg-surface overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-surface-container-lowest border-r border-outline-variant/30 z-20 h-full">
         <div className="p-6 flex items-center gap-3 border-b border-outline-variant/20">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
               <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
               <h1 className="font-display text-xl font-bold text-on-surface">Nexus</h1>
               <span className="text-xs font-label text-on-surface-variant font-medium">Academy App</span>
            </div>
         </div>
         
         <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
            {currentRole.nav.map((item: any, idx: number) => (
                <NavLink key={idx} to={item.href} className={({isActive}) => cn("flex items-center gap-3 px-4 py-3 rounded-full text-sm font-label font-bold transition-all", isActive ? "bg-secondary-container text-on-secondary-container" : "text-on-surface hover:bg-surface-variant/50")}>
                    <item.icon className="w-5 h-5" />
                    {item.label}
                </NavLink>
            ))}
         </div>

         {/* Role Switcher */}
         <div className="p-4 border-t border-outline-variant/20 relative" ref={menuRef}>
            {isRoleMenuOpen && (
               <div className="absolute bottom-[100%] mb-2 left-4 right-4 bg-surface-container-highest border border-outline-variant/40 rounded-2xl shadow-xl z-50 overflow-hidden transform-gpu animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="p-2 border-b border-outline-variant/20 bg-surface-container-low">
                     <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Switch Role View</span>
                  </div>
                  <div className="p-1 flex flex-col">
                  {Object.entries(ROLE_CONFIGS)
                     .filter(([key]) => key === 'builder' || (userInfo?.availableRoles?.includes(key)) || (userInfo?.availableRoles?.includes('volunteer') && key === 'staff'))
                     .map(([key, roleInfo]) => (
                        <button key={key} onClick={() => {
                            if (key === 'builder') {
                                const pwd = prompt("Enter pass code:");
                                if (pwd !== '4465') {
                                   logSystemEvent('warning', 'Invalid builder passcode attempt');
                                   alert('Invalid pass code.');
                                   setIsRoleMenuOpen(false);
                                   return;
                                }
                            }
                            const firstActive = roleInfo.nav[0].href;
                            navigate(firstActive);
                            if (userInfo) {
                               const newUserInfo = { ...userInfo, role: key };
                               localStorage.setItem('user', JSON.stringify(newUserInfo));
                               setUserInfo(newUserInfo);
                               setUserRole(key);
                               window.dispatchEvent(new Event('storage'));
                            }
                            setIsRoleMenuOpen(false);
                        }} className={cn("flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-surface-variant/50", currentRoleKey === key && "bg-surface-variant/80")}>
                           <span className="text-sm font-label font-bold text-on-surface">{roleInfo.roleLabel}</span>
                        </button>
                     ))}
                  </div>
               </div>
            )}
            <button onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)} className="w-full flex items-center justify-between p-3 rounded-2xl bg-surface-container-low hover:bg-surface-variant transition-colors border border-outline-variant/30">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center">
                     <span className="font-bold text-sm uppercase">{userInfo?.first_name?.[0] || 'U'}</span>
                  </div>
                  <div className="text-left">
                     <p className="font-bold text-sm text-on-surface">{userInfo?.first_name || 'User'} {userInfo?.last_name || ''}</p>
                     <p className="text-xs text-on-surface-variant font-label">{currentRole.roleLabel}</p>
                  </div>
               </div>
               <ChevronDown className="w-4 h-4 text-on-surface-variant" />
            </button>
            <div className="mt-2">
               <button onClick={async () => {
                   const u = localStorage.getItem('user');
                   if (u) {
                       try {
                           const parsed = JSON.parse(u);
                           if (parsed.sessionToken) {
                               await supabase.from('user_sessions').update({ logout_time: new Date().toISOString() }).eq('session_token', parsed.sessionToken);
                           }
                       } catch(e) {}
                   }
                   localStorage.removeItem('user');
                   navigate('/');
               }} className="flex items-center w-full gap-3 px-4 py-3 rounded-full text-error hover:bg-error-container/20 transition-all font-label font-bold">
                 <LogOut className="w-5 h-5" />
                 Sign Out
               </button>
            </div>
         </div>
      </aside>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
         <div className="md:hidden fixed inset-0 z-50 bg-scrim/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="absolute inset-y-0 left-0 w-3/4 max-w-sm bg-surface-container-lowest shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
               <div className="p-6 flex items-center justify-between border-b border-outline-variant/20">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center"><Building2 className="w-5 h-5 text-primary"/></div>
                     <span className="font-bold text-lg">Nexus</span>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)}><X className="w-6 h-6 text-on-surface-variant" /></button>
               </div>
               <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                  {currentRole.nav.map((item: any, idx: number) => (
                      <NavLink key={idx} onClick={() => setIsMobileMenuOpen(false)} to={item.href} className={({isActive}) => cn("flex items-center gap-3 px-4 py-3 rounded-full text-sm font-label font-bold transition-all", isActive ? "bg-secondary-container text-on-secondary-container" : "text-on-surface hover:bg-surface-variant/50")}>
                          <item.icon className="w-5 h-5" />
                          {item.label}
                      </NavLink>
                  ))}
               </div>
               {/* Mobile Role Switcher */}
               <div className="p-4 border-t border-outline-variant/20">
                   <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2 px-2">Switch Role</p>
                   <div className="flex flex-col gap-1">
                      {Object.entries(ROLE_CONFIGS)
                         .filter(([key]) => key === 'builder' || (userInfo?.availableRoles?.includes(key)) || (userInfo?.availableRoles?.includes('volunteer') && key === 'staff'))
                         .map(([key, roleInfo]) => (
                            <button key={key} onClick={() => {
                                if (key === 'builder') {
                                    const pwd = prompt("Enter pass code:");
                                    if (pwd !== '4465') {
                                       logSystemEvent('warning', 'Invalid builder passcode attempt');
                                       alert('Invalid pass code.');
                                       setIsMobileMenuOpen(false);
                                       return;
                                    }
                                }
                                const firstActive = roleInfo.nav[0].href;
                                navigate(firstActive);
                                if (userInfo) {
                                   const newUserInfo = { ...userInfo, role: key };
                                   localStorage.setItem('user', JSON.stringify(newUserInfo));
                                   setUserInfo(newUserInfo);
                                   setUserRole(key);
                                   window.dispatchEvent(new Event('storage'));
                                }
                                setIsMobileMenuOpen(false);
                            }} className={cn("flex items-center justify-between px-3 py-3 rounded-xl text-left hover:bg-surface-variant/50", currentRoleKey === key && "bg-surface-variant/80")}>
                               <span className="text-sm font-label font-bold text-on-surface">{roleInfo.roleLabel}</span>
                            </button>
                         ))}
                   </div>
               </div>
            </div>
         </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-surface">
         {/* Mobile Header */}
         <header className="md:hidden flex items-center justify-between p-4 bg-surface-container-lowest border-b border-outline-variant/30">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center"><Building2 className="w-5 h-5 text-primary"/></div>
               <span className="font-bold">Nexus</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 rounded-xl bg-surface-variant text-on-surface-variant group">
               <Menu className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
         </header>
         <div className="flex-1 overflow-auto">
            <Outlet />
         </div>
      </main>
    </div>
  );
}
`
);
