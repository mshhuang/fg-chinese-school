import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Flower2, Building2, BookOpen, Users, Settings, GraduationCap, ArrowRight, Database, Eye, EyeOff, ShieldAlert, AlertCircle, X, HelpCircle, KeyRound } from "lucide-react";
import { cn } from "../lib/utils";
import { supabase } from "../lib/supabase";
import { logSystemEvent } from "../lib/logSystemEvent";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  
  const [loginError, setLoginError] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [passcodeVal, setPasscodeVal] = useState("");
  const [passcodeError, setPasscodeError] = useState("");
  const pendingActionRef = useRef<(() => Promise<void> | void) | null>(null);

  const requestBuilderAccess = (action: () => Promise<void> | void) => {
      pendingActionRef.current = action;
      setShowPasscodeModal(true);
      setPasscodeVal("");
      setPasscodeError("");
      setIsLoading(false); // Make sure to stop loading if it was triggered by a form submission
  };

  useEffect(() => {
    // Clear any stale user session when hitting the login page
    localStorage.removeItem('user');
    
    async function checkSupabase() {
      try {
        const { error } = await supabase.auth.getSession();
        if (error) throw error;
        setDbStatus('connected');
      } catch (err) {
        console.error("Supabase connection error:", err);
        setDbStatus('error');
      }
    }
    checkSupabase();
  }, []);

  interface RoleDefinition {
    id: string;
    title: string;
    icon: any;
    subtitle: string;
    path: string;
    disabled?: boolean;
  }

  const roles: RoleDefinition[] = [
    {
      id: "admin",
      title: "School Admin",
      icon: Building2,
      subtitle: "Access school-wide administration.",
      path: "/admin/dashboard"
    },
    {
      id: "teacher",
      title: "Teacher",
      icon: BookOpen,
      subtitle: "Manage your classes and assignments.",
      path: "/teacher/dashboard"
    },
    {
      id: "parent",
      title: "Parent",
      icon: Users,
      subtitle: "View your child's academic updates.",
      path: "/parent/dashboard"
    },
    {
      id: "student",
      title: "Student",
      icon: GraduationCap,
      subtitle: "Access your learning portal.",
      path: "/student/dashboard"
    },
    {
      id: "staff",
      title: "Staff",
      icon: Users,
      subtitle: "View shifts, tasks, and announcements.",
      path: "/staff/dashboard"
    },
    {
      id: "volunteer",
      title: "Volunteer",
      icon: Users,
      subtitle: "View your shifts, tasks, and announcements.",
      path: "/volunteer/dashboard"
    },
    {
      id: "builder",
      title: "Builder",
      icon: Settings,
      subtitle: "View diagnostics, debug info, and configure system.",
      path: "/builder/dashboard"
    }
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (isLocked) {
      setLoginError("Too many failed attempts. Please try again in 1 minute.");
      return;
    }

    setIsLoading(true);

    try {
      const cleanEmail = email.trim();
      const cleanPassword = password.trim();
      


      // Manual auth against the 'users' table since we use it to store users
      const { data: matchedUsers, error: matchError } = await supabase
        .from('users')
        .select('*')
        .ilike('user_name', cleanEmail)
        .eq('password_hash', cleanPassword) as any;

      if (matchError || !matchedUsers || matchedUsers.length === 0) {
        await logSystemEvent('warning', 'Failed login attempt', { email: cleanEmail });
        
        const attempts = failedAttempts + 1;
        setFailedAttempts(attempts);
        if (attempts >= 5) {
           setIsLocked(true);
           setLoginError("Account locked due to too many failed attempts. Try again in 1 minute.");
           setTimeout(() => {
              setIsLocked(false);
              setFailedAttempts(0);
           }, 60000);
        } else {
           setLoginError(`Invalid username or password. You have ${5 - attempts} attempts remaining.`);
        }
        
        setIsLoading(false);
        return;
      }
      
      const userData = matchedUsers[0];
      
      setFailedAttempts(0);
      setLoginError("");

      // Fetch user roles for the matched user
      const { data: roleData } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role_id,
          roles (
            role_name
          )
        `)
        .eq('user_id', userData.user_id) as any;

      let userRoles = roleData?.map((r: any) => r.roles?.role_name?.toLowerCase()).filter(Boolean) || [];
      // Remove duplicates
      userRoles = [...new Set(userRoles)];

      const isHHuang = matchedUsers.some((u: any) => u.user_name === 'hhuang' || u.email === 'hhuang@example.com' || u.email === 'hhuang' || u.email === 'ms.huey.huang@gmail.com');

      if (!isHHuang) {
          userRoles = userRoles.filter((r: string) => r !== 'builder');
      }

      const expectedStudentUsername = userData.first_name && userData.last_name 
         ? (userData.first_name.charAt(0) + userData.last_name).toLowerCase().replace(/\s/g, '')
         : '';

      // Define student username condition
      const isStudentUsername = cleanEmail.toLowerCase() === expectedStudentUsername;

      let primaryRole = 'staff';
      
      if (userRoles.includes('admin')) {
         primaryRole = 'admin';
      } else if (userRoles.includes('teacher')) {
         primaryRole = 'teacher';
      } else if (userRoles.includes('builder')) {
         primaryRole = 'builder';
      } else if (userRoles.includes('student')) {
         primaryRole = 'student';
      } else if (isStudentUsername) {
         // If user logs in with 1st letter of firstname + lastname and has no other roles, default to student
         primaryRole = 'student';
         if (!userRoles.includes('student')) userRoles.push('student');
      } else if (userRoles.length > 0) {
         primaryRole = userRoles[0];
      } 

       const finishLogin = async () => {
          const sessionToken = crypto.randomUUID();

          // Store current minimal info to localStorage to simulate session
          localStorage.setItem('user', JSON.stringify({
            id: userData.user_id,
            user_id: userData.user_id,
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email || email,
            user_name: userData.user_name || email,
            role: primaryRole,
            availableRoles: userRoles,
            sessionToken
          }));
          

          // Also log the login activity
          let ipAddress = 'Unknown';
          try {
             const controller = new AbortController();
             const timeoutId = setTimeout(() => controller.abort(), 1500);
             const res = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
             clearTimeout(timeoutId);
             if (res.ok) {
                const data = await res.json();
                ipAddress = data.ip;
             }
          } catch (e) { }

          const ua = navigator.userAgent;
          let browser = "Unknown Browser";
          if (ua.includes("Firefox")) browser = "Firefox";
          else if (ua.includes("SamsungBrowser")) browser = "Samsung Browser";
          else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";
          else if (ua.includes("Trident") || ua.includes("MSIE")) browser = "Internet Explorer";
          else if (ua.includes("Edge")) browser = "Edge";
          else if (ua.includes("Chrome")) browser = "Chrome";
          else if (ua.includes("Safari")) browser = "Safari";
          
          let device = "Desktop";
          if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
             device = "Smartphone";
          } else if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
             device = "Tablet";
          } else if (ua.includes('Macintosh') || ua.includes('Windows') || ua.includes('Linux')) {
             device = "Laptop/Desktop";
          }

          await logSystemEvent('info', 'Logged into the system', {
             browser,
             ip_address: ipAddress,
             device_type: device
          });

          // Route based on role
          if (primaryRole === 'builder') {
             navigate('/builder/dashboard');
          } else if (primaryRole === 'admin') {
             navigate('/admin/dashboard');
          } else if (primaryRole === 'teacher') {
             navigate('/teacher/dashboard');
          } else if (primaryRole === 'parent') {
             navigate('/parent/dashboard');
          } else if (primaryRole === 'student') {
             navigate('/student/dashboard');
          } else if (primaryRole === 'staff') {
             navigate('/staff/dashboard');
          } else if (primaryRole === 'volunteer') {
             navigate('/volunteer/dashboard');
          } else {
             navigate('/admin/dashboard'); // default
          }
       };

      if (primaryRole === 'builder') {
          requestBuilderAccess(finishLogin);
      } else {
          // Check maintenance mode
          if (localStorage.getItem('system_maintenance') === 'true') {
              alert("System is currently under maintenance. Please try again later.");
              setIsLoading(false);
              return;
          }
          await finishLogin();
      }
    } catch (err) {
      console.error(err);
      setLoginError("An unexpected error occurred connecting to the database.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex relative isolate overflow-hidden">
      {/* Background Graphic */}
      <div className="absolute inset-0 bg-primary-fixed/20 -z-10 blur-3xl opacity-60"></div>
      
      {/* Left Axis: Login Form */}
      <div className="w-full flex flex-col justify-center px-8 md:px-16 lg:px-24 mx-auto overflow-y-auto py-12">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-2 md:mb-3">
            <img src="/picture1.png" alt="IBPS NY Chinese School" className="h-28 md:h-36 lg:h-[172px] w-auto object-contain" />
          </div>

          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-4xl font-bold text-on-surface tracking-tight">
              Welcome back
            </h2>
            
            <div className={cn(
               "flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm transition-opacity",
               dbStatus === 'checking' ? "opacity-0" : "opacity-100",
               dbStatus === 'connected' ? "bg-tertiary-container/30 text-tertiary border-tertiary-container/50" :
               "bg-error-container/30 text-error border-error-container/50"
            )}>
               <Database className="w-3.5 h-3.5" />
               <span className="font-label text-xs font-bold whitespace-nowrap">
                 {dbStatus === 'connected' ? 'Connected' : 'DB Error'}
               </span>
            </div>
          </div>


          {loginError && (
             <div className="mb-6 p-4 rounded-xl bg-error-container/30 border border-error-container text-error flex gap-3 text-sm font-body">
               <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
               <p>{loginError}</p>
             </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-5 bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 shadow-sm">
            <div className="flex flex-col gap-2">
              <label className="font-label text-sm font-bold text-on-surface">User Name</label>
              <input 
                type="text" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body bg-surface text-on-surface placeholder:text-outline"
                required
              />
            </div>
            
            <div className="flex flex-col gap-2">
               <div className="flex justify-between items-start">
                 <label className="font-label text-sm font-bold text-on-surface pt-1">Password</label>
                 <div className="flex flex-col items-end gap-1.5">
                   <button type="button" onClick={() => navigate('/forgot-password')} className="flex items-center gap-1.5 text-primary font-label text-xs hover:underline cursor-pointer group">
                     <HelpCircle className="w-3.5 h-3.5 text-secondary group-hover:scale-110 transition-transform" />
                     <span className="font-bold">Can't login?</span>
                   </button>
                   <button type="button" onClick={() => navigate('/forgot-password')} className="flex items-center gap-1.5 text-primary font-label text-xs hover:underline cursor-pointer group">
                     <KeyRound className="w-3.5 h-3.5 text-secondary group-hover:scale-110 transition-transform" />
                     <span className="font-bold">Forgot password?</span>
                   </button>
                 </div>
               </div>
               <div className="relative">
                 <input 
                   type={showPassword ? "text" : "password"} 
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   placeholder="••••••••"
                   className="w-full px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body bg-surface text-on-surface placeholder:text-outline pr-12"
                   required
                 />
                 <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                 </button>
               </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="mt-4 w-full bg-primary hover:bg-primary/90 text-on-primary py-3.5 rounded-full font-label font-bold text-sm tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              {isLoading ? "Signing in..." : "Sign In"}
              {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>

          </form>
        </div>
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

              <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (passcodeVal === '4465') {
                     setShowPasscodeModal(false);
                     setPasscodeVal('');
                     setPasscodeError('');
                     if (pendingActionRef.current) {
                         await pendingActionRef.current();
                     }
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
    </div>
  );
}
