import { useState } from "react";
import { Mail, MessageSquare, Send, X, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";

interface ComposeMessageModalProps {
  onClose: () => void;
  onSendInternal?: (to: string, message: string) => void;
}

export function ComposeMessageModal({ onClose, onSendInternal }: ComposeMessageModalProps) {
  const [method, setMethod] = useState<"internal" | "email">("email");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const handleSend = async () => {
    if (!to || !content) {
      setStatus({ type: "error", msg: "Please fill in recipient and message content." });
      return;
    }
    
    setIsSubmitting(true);
    setStatus(null);

    if (method === "email") {
      try {
        const res = await fetch("/api/messages/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to,
            subject: subject || "New Message from Nexus Academy Apps",
            text: content,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to send email via Resend");
        }

        setStatus({ type: "success", msg: "Email sent successfully via Resend API!" });
        setTimeout(() => {
          onClose();
        }, 2000);
      } catch (err: any) {
        setStatus({ 
          type: "error", 
          msg: `${err.message || "An error occurred while sending email."} (Note: On Resend's free tier, you can only send emails to the email address registered with your Resend account unless you verify a domain.)` 
        });
      }
    } else {
      // Simulate internal message send
      if (onSendInternal) {
        onSendInternal(to, content);
      }
      setStatus({ type: "success", msg: "Internal message sent successfully!" });
      setTimeout(() => {
        onClose();
      }, 1500);
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-surface-container-lowest w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-outline-variant/30 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="p-6 border-b border-surface-variant flex justify-between items-center bg-surface-container-low shrink-0">
           <h2 className="font-title text-xl font-bold text-on-surface">Compose New Message</h2>
           <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-surface-variant/50 text-on-surface-variant transition-colors">
              <X className="w-5 h-5" />
           </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
           
           {/* Method Toggle */}
           <div className="flex bg-surface-container rounded-xl p-1 border border-outline-variant/30">
              <button 
                 onClick={() => setMethod("internal")}
                 className={cn(
                   "flex-1 py-2.5 rounded-lg text-sm font-label flex items-center justify-center gap-2 transition-all",
                   method === "internal" 
                      ? "bg-surface shadow text-primary font-bold border border-outline-variant/20" 
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30"
                 )}
              >
                 <MessageSquare className="w-4 h-4" />
                 Internal Chat
              </button>
              <button 
                 onClick={() => setMethod("email")}
                 className={cn(
                   "flex-1 py-2.5 rounded-lg text-sm font-label flex items-center justify-center gap-2 transition-all relative",
                   method === "email" 
                      ? "bg-surface shadow text-primary font-bold border border-outline-variant/20" 
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30"
                 )}
              >
                 <Mail className="w-4 h-4" />
                 Email (Resend API)
                 {method !== 'email' && <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>}
              </button>
           </div>

           {status && (
              <div className={cn(
                "p-3 rounded-xl text-sm font-body border flex items-center gap-2",
                status.type === "success" ? "bg-primary-container/20 text-primary border-primary/20" : "bg-error-container/20 text-error border-error/20"
              )}>
                 {status.msg}
              </div>
           )}

           <div className="space-y-4">
              <div>
                 <label className="block text-xs font-label uppercase tracking-wider text-on-surface-variant mb-1 ml-1 cursor-text">
                    {method === "email" ? "To (Email Address)" : "To (User Name search)"}
                 </label>
                 <input 
                    type={method === "email" ? "email" : "text"}
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder={method === "email" ? "name@example.com" : "Search for someone..."}
                    className="w-full px-4 py-3 bg-surface rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body transition-all"
                 />
              </div>

              {method === "email" && (
                <div>
                   <label className="block text-xs font-label uppercase tracking-wider text-on-surface-variant mb-1 ml-1 cursor-text">
                      Subject
                   </label>
                   <input 
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Email subject line..."
                      className="w-full px-4 py-3 bg-surface rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body transition-all"
                   />
                </div>
              )}

              <div>
                 <label className="block text-xs font-label uppercase tracking-wider text-on-surface-variant mb-1 ml-1 cursor-text">
                    Message
                 </label>
                 <textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Type your message here..."
                    rows={6}
                    className="w-full px-4 py-3 bg-surface rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body resize-y transition-all"
                 />
              </div>
           </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-surface-variant bg-surface-container-low shrink-0 flex justify-end gap-3">
           <button 
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-full font-label font-bold text-on-surface-variant hover:bg-surface-variant transition-colors"
           >
              Cancel
           </button>
           <button 
              onClick={handleSend}
              disabled={isSubmitting || !to || !content}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full font-label font-bold bg-primary text-on-primary hover:bg-primary/90 transition-all opacity-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
           >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {method === "email" ? "Send via Resend" : "Send Message"}
           </button>
        </div>
      </div>
    </div>
  );
}
