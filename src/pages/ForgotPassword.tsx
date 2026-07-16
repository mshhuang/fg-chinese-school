import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Database } from "lucide-react";
import { logSystemEvent } from "../lib/logSystemEvent";
import { LoginProblemIcon } from "../components/LoginProblemIcon";
import { supabase } from "../lib/supabase";
import { cn } from "../lib/utils";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  useEffect(() => {
    // Clear any stale user session when hitting the forgot password page
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username) {
      setSubmitted(true);
      
      // Notify backend / system admins via system logs
      await logSystemEvent(
        "info", 
        "Password Reminder Request", 
        { username: username }, 
        "/forgot-password"
      );

      // Also notify builder via internal messages
      const BUILDER_USER_ID = 'ec13df7f-1a4f-422e-abd8-05732ca798d2';
      await supabase.from('internal_messages').insert({
        sender_id: BUILDER_USER_ID,
        recipient_id: BUILDER_USER_ID,
        subject: `[Password Request] Reminder for ${username}`,
        body: `A user requested a password reminder for the account/email: ${username}`,
        read_at: null
      });
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-surface relative isolate overflow-hidden items-start justify-center p-6 pt-8 sm:pt-12">
      <div className="absolute inset-0 bg-primary-fixed/20 -z-10 blur-3xl opacity-60"></div>
      <div className="w-full max-w-[400px] flex flex-col items-center">
        {/* Logo outside the card */}
        <div className="mb-8 w-full flex justify-start">
           <img src="/picture1.png" alt="IBPS NY Chinese School" className="h-[72px] sm:h-[84px] object-contain" />
        </div>

        {/* Welcome back header */}
        <div className="w-full flex items-center justify-between mb-6">
           <h2 className="font-display text-4xl font-bold text-on-surface tracking-tight">
             Welcome back
           </h2>
           <div className={cn(
               "flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-sm transition-opacity bg-[#cbf2d6] text-[#127038] border-[#a8e5b9]",
               dbStatus === 'checking' ? "opacity-0" : "opacity-100"
            )}>
               <Database className="w-3.5 h-3.5" />
               <span className="font-label text-[13px] font-bold whitespace-nowrap">
                 {dbStatus === 'connected' ? 'Connected' : 'DB Error'}
               </span>
            </div>
        </div>

        {/* Card */}
        <div 
          className="w-full bg-white rounded-[40px] px-6 sm:px-8 pb-8 pt-8 shadow-sm flex flex-col items-center relative"
                  >
          <div className="flex items-center justify-center mb-4">
             <LoginProblemIcon className="w-[84px] h-auto" />
          </div>

          <h1 className="font-display text-[22px] sm:text-[24px] text-on-surface font-extrabold text-center mb-2 tracking-tight">
            Having problem with login?
          </h1>
          <p className="font-body text-[#555555] text-[15px] text-center mb-8 px-2 leading-relaxed">
            Enter your name or email and we'll email you<br/>the login information
          </p>

          {submitted ? (
            <div className="w-full bg-green-500/10 text-green-700 p-4 rounded-2xl mb-8 font-body text-center border border-green-500/20">
              If an account exists for <b className="font-bold">{username}</b>, you will receive password reset instructions.
            </div>
          ) : (
            <form className="w-full flex flex-col gap-5 mb-8" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <label className="font-label text-sm text-[#111111] font-bold">Name / Email</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-surface border border-outline-variant/50 rounded-[14px] pl-11 pr-4 py-3.5 font-body text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-outline"
                    placeholder="Enter your name or email"
                    required
                  />
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#666666]" strokeWidth={2} />
                </div>
              </div>
              
              <button 
                type="submit" 
                className="w-full text-white py-4 rounded-xl font-label font-bold text-[17px] hover:opacity-90 transition-all active:scale-[0.98] mt-2 flex items-center justify-center gap-2"
                style={{ backgroundColor: '#6B5E0A' }}
              >
                Reset Password
              </button>
            </form>
          )}

          <button 
            onClick={() => navigate('/')} 
            className="flex items-center justify-center gap-2 font-body hover:underline text-[15px] font-medium"
            style={{ color: '#6B5E0A' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
