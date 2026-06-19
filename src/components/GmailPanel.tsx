import { useState, useEffect } from 'react';
import { Mail, Edit, Inbox, Loader2, Send } from 'lucide-react';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn, logout } from '../lib/auth';
import { fetchGmailMessages, sendGmailMessage } from '../lib/gmail';
import { cn } from '../lib/utils';
import { ComposeMessageModal } from './ComposeMessageModal';

export function GmailPanel() {
  const [needsAuth, setNeedsAuth] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [activeMessage, setActiveMessage] = useState<any | null>(null);
  const [showCompose, setShowCompose] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (u) => {
        setUser(u);
        setNeedsAuth(false);
        loadMessages();
      },
      () => {
        setNeedsAuth(true);
        setUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setErrorMsg(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setNeedsAuth(false);
        loadMessages();
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      setErrorMsg(err.message || 'Failed to redirect to Google for sign in. Please try again.');
    } finally {
      // isLoggingIn will stay true if the page redirects for OAuth
      setIsLoggingIn(false);
    }
  };

  const loadMessages = async () => {
    setLoadingMessages(true);
    try {
      const msgs = await fetchGmailMessages();
      setMessages(msgs);
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  if (needsAuth) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-8">
        <Mail className="w-16 h-16 text-primary mb-6" />
        <h2 className="font-title text-2xl font-bold mb-2">Connect your Gmail</h2>
        <p className="font-body text-on-surface-variant mb-8 max-w-md text-center">
          Sign in with Google to view and send emails directly from the app.
        </p>
        <button 
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="flex items-center gap-3 px-6 py-3 bg-surface border border-outline-variant rounded-full shadow-sm hover:bg-surface-variant transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            <path fill="none" d="M1 1h22v22H1z" />
          </svg>
          <span className="font-label font-bold text-on-surface">Sign in with Google</span>
          {isLoggingIn && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
        </button>
        {errorMsg && (
          <div className="mt-6 p-4 bg-error-container/30 border border-error text-error text-sm rounded-xl max-w-md text-center font-body">
            {errorMsg}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0 h-full">
      {/* Inbox List */}
      <div className={cn(
        "w-full md:w-[380px] flex-col gap-4 h-full shrink-0",
        activeMessage ? "hidden md:flex" : "flex"
      )}>
        <div className="flex items-center justify-between bg-surface-container-lowest p-4 rounded-3xl border border-outline-variant/30">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0">
               <Inbox className="w-5 h-5" />
             </div>
             <div>
               <p className="font-label font-bold">Gmail Inbox</p>
               <p className="text-xs text-on-surface-variant font-caption truncate max-w-[200px]">{user?.email}</p>
             </div>
           </div>
           
           <div className="flex items-center gap-2">
             <button onClick={() => setShowCompose(true)} className="p-2 bg-primary text-on-primary rounded-xl shrink-0 transition-colors hover:bg-primary/90 shadow-sm" title="Compose">
               <Edit className="w-4 h-4" />
             </button>
             <button onClick={logout} className="p-2 bg-error-container text-on-error-container rounded-xl shrink-0 transition-colors hover:bg-error-container/90 shadow-sm" title="Sign out">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
             </button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2 hide-scrollbar">
          {loadingMessages ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center p-8 text-on-surface-variant">
              No messages found.
            </div>
          ) : (
            messages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => setActiveMessage(msg)}
                className={cn(
                  "w-full flex flex-col items-start gap-1 p-4 rounded-2xl transition-all border outline-none text-left",
                  activeMessage?.id === msg.id 
                    ? "bg-primary-container/10 border-primary-container/30 shadow-sm"
                    : "bg-surface hover:bg-surface-container-low border-transparent hover:border-outline-variant/30"
                )}
              >
                <div className="flex justify-between items-center w-full mb-1">
                  <span className={cn("font-label text-sm truncate pr-2", msg.unread ? "font-bold text-on-surface" : "text-on-surface-variant")}>
                    {msg.from.split('<')[0].replace(/"/g, '').trim()}
                  </span>
                  <span className="font-caption text-xs whitespace-nowrap text-on-surface-variant shrink-0">
                    {new Date(msg.date).toLocaleDateString()}
                  </span>
                </div>
                <span className={cn("font-label text-sm truncate w-full", msg.unread ? "font-bold text-on-surface" : "text-on-surface-variant")}>
                  {msg.subject || "(No Subject)"}
                </span>
                <p className="font-body text-xs text-on-surface-variant truncate w-full mt-1.5 opacity-80">
                  {msg.snippet}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Reading pane */}
      {activeMessage ? (
        <div className="flex-1 bg-surface-container-lowest rounded-3xl border border-outline-variant/40 shadow-sm flex flex-col h-full overflow-hidden relative">
           <div className="flex flex-col border-b border-surface-variant bg-surface/50 backdrop-blur-md shrink-0">
             <div className="p-4 flex items-center gap-3">
               <button className="md:hidden p-2 -ml-2 rounded-full hover:bg-surface-variant/50" onClick={() => setActiveMessage(null)}>
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
               </button>
               <h2 className="font-title text-xl font-bold">{activeMessage.subject || "(No Subject)"}</h2>
             </div>
             
             <div className="px-6 py-3 flex items-center justify-between bg-surface-container-lowest border-t border-surface-variant/50">
               <div className="space-y-1">
                 <p className="font-label text-sm">From: <span className="text-on-surface-variant font-body">{activeMessage.from}</span></p>
                 <p className="font-label text-sm">To: <span className="text-on-surface-variant font-body">{activeMessage.to}</span></p>
               </div>
               <p className="font-caption text-xs text-on-surface-variant">{new Date(activeMessage.date).toLocaleString()}</p>
             </div>
           </div>

           <div className="flex-1 overflow-y-auto p-6 font-body text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizeBody(activeMessage.body) }} />
        </div>
      ) : (
         <div className="hidden md:flex flex-1 items-center justify-center bg-surface-container-lowest rounded-3xl border border-outline-variant/30">
            <div className="text-center flex flex-col items-center gap-4">
               <div className="w-16 h-16 bg-surface-variant rounded-full flex items-center justify-center text-on-surface-variant">
                  <Mail className="w-8 h-8 opacity-50" />
               </div>
               <p className="font-body text-on-surface-variant">Select an email to read</p>
            </div>
         </div>
      )}

      {showCompose && <GmailComposeModal onClose={() => setShowCompose(false)} onSent={loadMessages} />}
    </div>
  );
}

// Very basic sanitization, real apps use dompurify
function sanitizeBody(htmlStr: string) {
  if (!htmlStr) return '';
  return htmlStr.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

function GmailComposeModal({ onClose, onSent }: { onClose: () => void; onSent: () => void }) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<{type: "error"|"success", msg:string}|null>(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!to || !content) return;
    const confirmed = window.confirm(`Are you sure you want to send this email to ${to}?`);
    if (!confirmed) return;

    setLoading(true);
    try {
      await sendGmailMessage(to, subject, content);
      setStatus({ type: "success", msg: "Message sent!" });
      setTimeout(() => {
        onSent();
        onClose();
      }, 1500);
    } catch (e: any) {
      setStatus({ type: "error", msg: e.message || "Failed to send" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
      <div className="bg-surface-container-lowest w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col mb-[10vh]" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-surface-variant flex justify-between items-center bg-surface-container-low shrink-0">
           <h2 className="font-title text-lg font-bold">New Email</h2>
           <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-variant/50"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
        </div>
        <div className="p-6 space-y-4">
           {status && (
             <div className={cn("p-3 rounded-lg text-sm", status.type === "success" ? "bg-primary-container text-on-primary-container" : "bg-error-container text-on-error-container")}>
               {status.msg}
             </div>
           )}
           <input type="email" placeholder="To" value={to} onChange={(e) => setTo(e.target.value)} className="w-full px-4 py-3 bg-surface rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body" />
           <input type="text" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-4 py-3 bg-surface rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body" />
           <textarea placeholder="Message" value={content} onChange={(e) => setContent(e.target.value)} rows={6} className="w-full px-4 py-3 bg-surface rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body resize-y" />
        </div>
        <div className="p-4 border-t flex justify-end gap-3 bg-surface-container-low">
          <button onClick={onClose} disabled={loading} className="px-6 py-2.5 rounded-full text-on-surface-variant hover:bg-surface-variant font-label">Cancel</button>
          <button onClick={handleSend} disabled={loading || !to || !content} className="flex px-6 py-2.5 rounded-full bg-primary text-on-primary font-label gap-2 items-center hover:opacity-90 disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
