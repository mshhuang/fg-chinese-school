import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { 
  Building2, User, Users as ParentUsers, GraduationCap, Settings as Wrench, Pickaxe,
  LayoutDashboard, School, MessageSquare, Calendar, Users, Bell, Flower2, BookOpen, Settings, Megaphone, Newspaper, ChevronDown, Check, LogOut, Database, KeyRound, Clock, Activity, TerminalSquare, RefreshCcw, Server, ShieldAlert, AlertCircle,
  Menu, X
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useState, useRef, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { logSystemActivity } from "../../lib/logger";
import { logSystemEvent } from "../../lib/logSystemEvent";

const ROLE_CONFIGS: Record<string, any> = {
  admin: { name: "Emily", roleLabel: "School Admin", badge: "Admin", nav: [ { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" }, { icon: School, label: "Classes", href: "/admin/classes" }, { icon: BookOpen, label: "Lesson Plans", href: "/admin/plans" }, { icon: MessageSquare, label: "Messages", href: "/admin/messages" }, { icon: Megaphone, label: "Announcements", href: "/admin/announcements" }, { icon: Newspaper, label: "Newsletters", href: "/admin/newsletters" }, { icon: Settings, label: "Management", href: "/admin/management" }, { icon: Activity, label: "Recent Activities", href: "/admin/activities" }, { icon: User, label: "My Profile", href: "/profile" } ] },
  teacher: { name: "Chen Jian", roleLabel: "Teacher", badge: "Faculty", nav: [ { icon: LayoutDashboard, label: "Dashboard", href: "/teacher/dashboard" }, { icon: School, label: "My Classes", href: "/teacher/classes" }, { icon: BookOpen, label: "Lesson Plans", href: "/teacher/lessons" }, { icon: MessageSquare, label: "Messages", href: "/teacher/messages" }, { icon: Megaphone, label: "Announcements", href: "/teacher/announcements" }, { icon: Newspaper, label: "Newsletters", href: "/teacher/newsletters" }, { icon: User, label: "My Profile", href: "/profile" } ] },
  parent: { name: "Wei Lin", roleLabel: "Parent", badge: "Family", nav: [ { icon: LayoutDashboard, label: "Dashboard", href: "/parent/dashboard" }, { icon: Megaphone, label: "Announcements", href: "/parent/announcements" }, { icon: BookOpen, label: "Grades", href: "/parent/grades" }, { icon: Calendar, label: "Schedule", href: "/parent/schedule" }, { icon: MessageSquare, label: "Messages", href: "/parent/messages" }, { icon: User, label: "My Profile", href: "/profile" } ] },
  student: { name: "Mei Lin", roleLabel: "Student", badge: "Grade 4", nav: [ { icon: LayoutDashboard, label: "Dashboard", href: "/student/dashboard" }, { icon: Megaphone, label: "Announcements", href: "/student/announcements" }, { icon: MessageSquare, label: "Messages", href: "/student/messages" }, { icon: User, label: "My Profile", href: "/profile" }, { icon: BookOpen, label: "Assignments", href: "/student/assignments" }, { icon: Calendar, label: "Schedule", href: "/student/schedule" }, { icon: Users, label: "Clubs", href: "/student/clubs" } ] },
  staff: { name: "David", roleLabel: "Staff", badge: "Operations", nav: [ { icon: LayoutDashboard, label: "Dashboard", href: "/staff/dashboard" }, { icon: Megaphone, label: "Announcements", href: "/staff/announcements" }, { icon: User, label: "My Profile", href: "/profile" } ] },
  builder: { name: "Vickie", roleLabel: "Builder", badge: "System", nav: [ { icon: LayoutDashboard, label: "Dashboard", href: "/builder/dashboard" }, { icon: Database, label: "Database", href: "/builder/database" }, { icon: Megaphone, label: "Announcements", href: "/builder/announcements" }, { icon: MessageSquare, label: "Messages", href: "/builder/messages" }, { icon: Users, label: "User Management", href: "/builder/users" }, { icon: Clock, label: "Sessions", href: "/builder/sessions" } ] }
};

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [passcodeVal, setPasscodeVal] = useState("");
  const [passcodeError, setPasscodeError] = useState("");
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const proceedWithRoleSwitch = (key: string) => {
      const roleInfo = ROLE_CONFIGS[key];
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
      setIsMobileMenuOpen(false);
  };

  const handleRoleSelect = (key: string) => {
      if (key === 'builder') {
          setShowPasscodeModal(true);
          setIsRoleMenuOpen(false);
          setIsMobileMenuOpen(false);
          setPasscodeVal("");
          setPasscodeError("");
          return;
      }
      proceedWithRoleSwitch(key);
  };


  useEffect(() => {
    const handler = () => {
        const currentUserStr = localStorage.getItem("user");
        if (currentUserStr) {
            try {
                const currentUser = JSON.parse(currentUserStr);
                
                // Enforce maintenance mode
                if (localStorage.getItem('system_maintenance') === 'true' && currentUser.role !== 'builder') {
                    localStorage.removeItem('user');
                    alert("System is currently under maintenance. You have been logged out.");
                    navigate('/login');
                    return;
                }
                
                setUserInfo(currentUser);
                setUserRole(currentUser.role);
            } catch (e) {}
        }
    };
    handler();
    window.addEventListener("storage", handler);
    window.addEventListener("ann_read_updated", handler);
    return () => {
        window.removeEventListener("storage", handler);
        window.removeEventListener("ann_read_updated", handler);
    }
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
            setIsRoleMenuOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
     if (localStorage.getItem('system_maintenance') === 'true' && userInfo?.role !== 'builder' && userInfo?.role) {
         localStorage.removeItem('user');
         alert("System is currently under maintenance. You have been logged out.");
         navigate('/login');
     }
  }, [location.pathname, userInfo]);

  const isUtilityRoute = location.pathname.startsWith("/profile") || location.pathname.startsWith("/change-password");
  const targetRoleKey = Object.keys(ROLE_CONFIGS).find(key => location.pathname.startsWith("/" + key));
  const pathRoleKey = targetRoleKey || (userRole === "volunteer" ? "staff" : (userRole || "admin"));
  const resolvedAvailableRoles = userInfo?.availableRoles?.map((r: string) => r === "volunteer" ? "staff" : r) || [];
  
  const hasAccessToPathRole = isUtilityRoute || pathRoleKey === "builder" || resolvedAvailableRoles.includes(pathRoleKey) || (userInfo && (userInfo.role === pathRoleKey || (userInfo.role === "volunteer" && pathRoleKey === "staff")));
  
  const currentRoleKey = isUtilityRoute ? (userRole === "volunteer" ? "staff" : (userRole || "admin")) : (hasAccessToPathRole ? pathRoleKey : (userRole === "volunteer" ? "staff" : (userRole || "admin")));
  const currentRole = ROLE_CONFIGS[currentRoleKey] || ROLE_CONFIGS["admin"];

  useEffect(() => {
     if (userInfo && !hasAccessToPathRole) {
        navigate("/" + (userRole === "volunteer" ? "staff" : userRole) + "/dashboard");
     }
  }, [userInfo, hasAccessToPathRole, navigate, userRole, location.pathname]);

  useEffect(() => {
    if (!userInfo) return;
    const currentUserId = userInfo.id || userInfo.user_id;
    if (!currentUserId) return;

    const fetchUnread = async () => {
       const { count } = await supabase
         .from("internal_messages")
         .select("*", { count: "exact", head: true })
         .eq("recipient_id", currentUserId)
         .is("read_at", null);
       setUnreadMessagesCount(count || 0);
    };

    fetchUnread();

    const channel = supabase
      .channel('public:internal_messages_layout_' + currentUserId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'internal_messages', filter: `recipient_id=eq.${currentUserId}` }, () => {
         fetchUnread();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userInfo]);

  return (
    <div className="flex h-screen w-full bg-surface overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-surface-container-lowest border-r border-outline-variant/30 z-20 h-full">
         <div className="p-6 flex items-center gap-3 border-b border-outline-variant/20">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
               <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
               <h1 className="font-display text-xl font-bold text-on-surface">佛光中文學校</h1>
               <span className="text-xs font-label text-on-surface-variant font-medium">App</span>
            </div>
         </div>
         
         <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
            {currentRole.nav.map((item: any, idx: number) => (
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
                     .filter(([key]) => {
                         if (key === "builder") {
                             return userInfo?.user_name === "hhuang" || userInfo?.email === "hhuang@example.com" || userInfo?.email === "hhuang";
                         }
                         return (userInfo?.availableRoles?.includes(key)) || (userInfo?.availableRoles?.includes("volunteer") && key === "staff");
                     })
                     .map(([key, roleInfo]) => (
                        <button key={key} onClick={() => handleRoleSelect(key)} className={cn("flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-surface-variant/50", currentRoleKey === key && "bg-surface-variant/80")}>
                           <span className="text-sm font-label font-bold text-on-surface">{roleInfo.roleLabel}</span>
                        </button>
                     ))}
                  </div>
               </div>
            )}
            <button onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)} className="w-full flex items-center justify-between p-3 rounded-2xl bg-surface-container-low hover:bg-surface-variant transition-colors border border-outline-variant/30">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center">
                     <span className="font-bold text-sm uppercase">{userInfo?.first_name?.[0] || "U"}</span>
                  </div>
                  <div className="text-left">
                     <p className="font-bold text-sm text-on-surface">{userInfo?.first_name || "User"} {userInfo?.last_name || ""}</p>
                     <p className="text-xs text-on-surface-variant font-label">{currentRole.roleLabel}</p>
                  </div>
               </div>
               <ChevronDown className="w-4 h-4 text-on-surface-variant" />
            </button>
            <div className="mt-2">
               <button onClick={async () => {
                   const u = localStorage.getItem("user");
                   if (u) {
                       try {
                           const parsed = JSON.parse(u);
                           if (parsed.sessionToken) {
                               // @ts-ignore
                               await supabase.from("user_sessions").update({ logout_time: new Date().toISOString() }).eq("session_token", parsed.sessionToken);
                           }
                       } catch(e) {}
                   }
                   localStorage.removeItem("user");
                   navigate("/");
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
                     <span className="font-bold text-lg">佛光中文學校</span>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)}><X className="w-6 h-6 text-on-surface-variant" /></button>
               </div>
               <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                  {currentRole.nav.map((item: any, idx: number) => (
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
                  ))}
               </div>
               {/* Mobile Role Switcher */}
               <div className="p-4 border-t border-outline-variant/20">
                   <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2 px-2">Switch Role</p>
                   <div className="flex flex-col gap-1">
                      {Object.entries(ROLE_CONFIGS)
                         .filter(([key]) => {
                              if (key === "builder") {
                                  return userInfo?.user_name === "hhuang" || userInfo?.email === "hhuang@example.com" || userInfo?.email === "hhuang";
                              }
                              return (userInfo?.availableRoles?.includes(key)) || (userInfo?.availableRoles?.includes("volunteer") && key === "staff");
                         })
                         .map(([key, roleInfo]) => (
                            <button key={key} onClick={() => handleRoleSelect(key)} className={cn("flex items-center justify-between px-3 py-3 rounded-xl text-left hover:bg-surface-variant/50", currentRoleKey === key && "bg-surface-variant/80")}>
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
               <span className="font-bold">佛光中文學校</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 rounded-xl bg-surface-variant text-on-surface-variant group">
               <Menu className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
         </header>
         <div className="flex-1 overflow-auto">
            <Outlet />
         </div>

         {/* Passcode Modal for Builder Role */}
         {showPasscodeModal && (
           <div className="fixed inset-0 z-[100] bg-scrim/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowPasscodeModal(false)}>
              <div className="bg-surface-container-highest rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-2xl relative" onClick={e => e.stopPropagation()}>
                 <button 
                    onClick={() => setShowPasscodeModal(false)}
                    className="absolute top-4 right-4 p-2 text-on-surface-variant hover:bg-surface-variant rounded-full"
                 >
                    <X className="w-5 h-5" />
                 </button>
                 
                 <div className="mb-6 mt-2">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 text-primary">
                       <ShieldAlert className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-display font-bold text-on-surface mb-2">Builder Access</h2>
                    <p className="text-sm font-body text-on-surface-variant">Enter the passcode to access the builder view.</p>
                 </div>

                 <form onSubmit={(e) => {
                     e.preventDefault();
                     if (passcodeVal === '4465') {
                        setShowPasscodeModal(false);
                        setPasscodeVal('');
                        setPasscodeError('');
                        proceedWithRoleSwitch('builder');
                     } else {
                        logSystemEvent('warning', 'Invalid builder passcode attempt');
                        setPasscodeError('Invalid passcode. Please try again.');
                     }
                 }}>
                    <div className="space-y-4">
                       <div>
                          <input 
                             type="password"
                             autoFocus
                             value={passcodeVal}
                             onChange={(e) => { setPasscodeVal(e.target.value); setPasscodeError(''); }}
                             placeholder="Passcode"
                             className={cn(
                                "w-full px-4 py-3 rounded-xl bg-surface-lowest border focus:outline-none focus:ring-2 transition-all font-body",
                                passcodeError ? "border-error focus:ring-error/20" : "border-outline-variant/50 focus:border-primary focus:ring-primary/20"
                             )}
                          />
                          {passcodeError && (
                             <p className="mt-2 text-xs font-bold text-error flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                {passcodeError}
                             </p>
                          )}
                       </div>
                       
                       <button 
                          type="submit"
                          className="w-full py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-xl font-label font-bold transition-all shadow-md active:scale-95"
                       >
                          Access Builder View
                       </button>
                    </div>
                 </form>
              </div>
           </div>
         )}
      </main>
    </div>
  );
}
