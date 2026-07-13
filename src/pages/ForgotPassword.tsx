import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User } from "lucide-react";
import { logSystemEvent } from "../lib/logSystemEvent";
import { LoginProblemIcon } from "../components/LoginProblemIcon";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [submitted, setSubmitted] = useState(false);

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
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-surface items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-container-low) 100%)' }}>
      <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl px-8 sm:px-12 pb-8 sm:pb-12 pt-4 sm:pt-6 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-outline-variant/30 flex flex-col items-center">
        <img src="/picture1.png" alt="IBPS NY Chinese School" className="w-auto h-28 object-contain mb-2" />
        
        <div className="flex items-center justify-center mb-3 text-primary">
           <LoginProblemIcon className="w-32 h-auto drop-shadow-sm" />
        </div>

        <h1 className="font-display text-2xl text-on-surface font-bold text-center mb-2 tracking-tight">
          Having problem with login?
        </h1>
        <p className="font-body text-on-surface-variant text-center mb-8">
          Enter your name or email and we'll email you the login information
        </p>

        {submitted ? (
          <div className="w-full bg-green-500/10 text-green-700 p-4 rounded-2xl mb-8 font-body text-center border border-green-500/20">
            If an account exists for <b className="font-bold">{username}</b>, you will receive password reset instructions.
          </div>
        ) : (
          <form className="w-full flex flex-col gap-5 mb-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label className="font-label text-sm text-on-surface font-bold">Name / Email</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-surface border border-outline-variant/50 rounded-2xl pl-12 pr-4 py-3.5 font-body text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="Enter your name or email"
                  required
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
              </div>
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-primary text-on-primary py-4 rounded-2xl font-label font-bold text-lg hover:bg-primary/95 transition-all shadow-md active:scale-[0.98] mt-2 flex items-center justify-center gap-2"
            >
              Reset Password
            </button>
          </form>
        )}

        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-primary font-label hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>
      </div>
    </div>
  );
}
