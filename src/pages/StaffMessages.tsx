import { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { ComposeMessageModal } from "../components/ComposeMessageModal";
import { InternalMessagesPanel } from "../components/InternalMessagesPanel";
import { GmailPanel } from "../components/GmailPanel";

export default function StaffMessages() {
  const [chatType, setChatType] = useState<"internal" | "external">("internal");
  const [showCompose, setShowCompose] = useState(false);
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setUserRole(u.role || "");
      } catch (e) {
        // ignore
      }
    }
  }, []);

  return (
    <div className="w-full max-w-[1600px] mx-auto flex flex-col lg:h-screen lg:overflow-hidden bg-background">
       <header className="px-6 md:px-8 py-8 md:py-10 pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
         <h1 className="font-display text-4xl text-primary font-bold tracking-tight">Messages</h1>
         
         {/* Internal / External Toggle */}
         {userRole === 'builder' && (
           <div className="flex bg-surface-container-low p-1 rounded-full border border-outline-variant/20 w-full md:w-64">
             <button 
               onClick={() => setChatType("internal")}
               className={cn(
                 "flex-1 py-2 text-sm font-label rounded-full transition-all",
                 chatType === "internal" 
                  ? "bg-surface shadow text-primary font-bold border border-outline-variant/20" 
                  : "text-on-surface-variant hover:text-on-surface"
               )}
             >
               Internal Chat
             </button>
             <button 
               onClick={() => setChatType("external")}
               className={cn(
                 "flex-1 py-2 text-sm font-label rounded-full transition-all",
                 chatType === "external" 
                  ? "bg-surface shadow text-primary font-bold border border-outline-variant/20" 
                  : "text-on-surface-variant hover:text-on-surface"
               )}
             >
               External (Gmail)
             </button>
           </div>
         )}
       </header>

       <div className="flex-1 w-full px-6 md:px-8 pb-32 md:pb-8 flex flex-col lg:flex-row gap-6 min-h-0">
          
          {chatType === "external" ? (
             <GmailPanel />
          ) : (
             <InternalMessagesPanel />
          )}
       </div>
       {showCompose && <ComposeMessageModal onClose={() => setShowCompose(false)} />}
    </div>
  );
}
