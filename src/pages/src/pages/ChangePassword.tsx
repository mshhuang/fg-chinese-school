import React, { useState } from "react";
import { KeyRound, Lock, AlertCircle, CheckCircle2, ChevronLeft, Eye, EyeOff } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";
import { logSystemEvent } from "../lib/logSystemEvent";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      setLoading(false);
      return;
    }

    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error("You must be logged in to change your password.");
      }

      const user = JSON.parse(userStr);

      // Verify current password
      const { data: userData, error: verifyError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', user.id)
        .eq('password_hash', currentPassword)
        .limit(1)
        .single();

      if (verifyError || !userData) {
        setMessage({ type: 'error', text: 'Current password is incorrect.' });
        setLoading(false);
        return;
      }

      // Update password
      const { error: updateError } = await (supabase
        .from('users')
        .update as any)({ password_hash: newPassword })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      await logSystemEvent('success', 'User password successfully changed', { user_id: user.id });

      setMessage({ type: 'success', text: 'Password has been successfully changed!' });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error(err);
      logSystemEvent('error', 'User password change failed', { error: err.message });
      setMessage({ type: 'error', text: err.message || 'Failed to change password. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 md:p-8 pt-6">
      <header className="mb-8 md:mb-12 max-w-2xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label font-bold text-sm mb-6"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Portal
        </button>
        <h1 className="font-display text-4xl text-primary font-bold tracking-tight mb-3">Change Password</h1>
        <p className="font-body text-lg text-on-surface-variant">Update your account security details.</p>
      </header>

      <div className="max-w-2xl mx-auto">
        <div className="bg-surface-container-lowest p-6 md:p-10 rounded-3xl border border-outline-variant/40 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
          
          <h2 className="font-title text-xl font-bold text-on-surface mb-8 flex items-center gap-2">
             <KeyRound className="w-5 h-5 text-primary" /> Update Password
          </h2>

          {message && (
            <div className={cn(
              "mb-8 p-4 rounded-xl flex items-center gap-3 font-body text-sm font-bold animate-in fade-in duration-300",
              message.type === 'success' ? "bg-green-100 text-green-800 border border-green-200" : "bg-orange-100 text-orange-800 border border-orange-200"
            )}>
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <label className="font-label text-sm font-bold text-on-surface-variant block mb-2">Current Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input 
                  type={showPasswords ? "text" : "password"} 
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-surface rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body text-base"
                  placeholder="Enter your current password"
                />
                <button 
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  {showPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="h-px w-full bg-outline-variant/20 my-2"></div>

            <div>
              <label className="font-label text-sm font-bold text-on-surface-variant block mb-2">New Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input 
                  type={showPasswords ? "text" : "password"} 
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-surface rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body text-base"
                  placeholder="Enter new password (min. 6 characters)"
                />
              </div>
            </div>

            <div>
              <label className="font-label text-sm font-bold text-on-surface-variant block mb-2">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input 
                  type={showPasswords ? "text" : "password"} 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-surface rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body text-base"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <div className="mt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary text-on-primary py-3.5 rounded-xl font-label font-bold shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Updating Password..." : "Change Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
