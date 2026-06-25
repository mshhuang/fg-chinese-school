import React, { useState, useEffect, useCallback, useRef } from "react";
import { Search, Edit, MoreVertical, Paperclip, Send, User as UserIcon, ChevronLeft, ChevronDown, Loader2, Trash2, Edit2, RefreshCw, X, ImageIcon } from "lucide-react";
import { cn } from "../lib/utils";
import { supabase } from "../lib/supabase";

export function InternalMessagesPanel() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [newMessageText, setNewMessageText] = useState("");
  const [sending, setSending] = useState(false);
  
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editMessageText, setEditMessageText] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAttachImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
       alert("Please select an image file.");
       return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
         const canvas = document.createElement("canvas");
         let w = img.width;
         let h = img.height;
         
         const MAX_WIDTH = 800; // Limit width to keep payload small
         if (w > MAX_WIDTH) {
           h = (MAX_WIDTH / w) * h;
           w = MAX_WIDTH;
         }
         canvas.width = w;
         canvas.height = h;
         const ctx = canvas.getContext("2d");
         if (ctx) {
           ctx.drawImage(img, 0, 0, w, h);
           // compress heavily for pg payload limit
           const compressed = canvas.toDataURL("image/webp", 0.6);
           setAttachedImage(compressed);
         }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const fetchMessages = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const { data } = await supabase.from("internal_messages").select("*").order("sent_at", { ascending: true });
      if (data) setMessages(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let channel: any;

    const init = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setCurrentUser(session.user);
        } else {
          // If no session, fallback to local storage user (useful for some mocked flows)
          const localStr = localStorage.getItem('user');
          if (localStr) setCurrentUser(JSON.parse(localStr));
        }

        const [usersRes, messagesRes] = await Promise.all([
          supabase.from("users").select("user_id, first_name, last_name, user_roles(roles(role_name))"),
          supabase.from("internal_messages").select("*").order("sent_at", { ascending: true })
        ]);
        
        if (usersRes.data) {
          const mappedUsers = usersRes.data.map((u: any) => ({
            ...u,
            role_names: (u.user_roles || []).map((ur: any) => ur.roles?.role_name).filter(Boolean)
          }));
          setAllUsers(mappedUsers);
        }
        if (messagesRes.data) setMessages(messagesRes.data);

        // Supabase realtime channel
        channel = supabase
          .channel('public:internal_messages_' + Math.random().toString(36).substring(7))
          .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'internal_messages' }, (payload: any) => {
            if (payload.eventType === 'INSERT') {
               setMessages((prev: any[]) => {
                 if (prev.find(m => m.message_id === payload.new.message_id)) return prev;
                 return [...prev, payload.new].sort((a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime());
               });
            } else if (payload.eventType === 'UPDATE') {
               setMessages((prev: any[]) => prev.map(m => m.message_id === payload.new.message_id ? payload.new : m));
            } else if (payload.eventType === 'DELETE') {
               setMessages((prev: any[]) => prev.filter(m => m.message_id !== payload.old.message_id));
            }
          })
          .subscribe();

        // Fallback polling
        const intervalId = setInterval(async () => {
           const res = await supabase.from("internal_messages").select("*").order("sent_at", { ascending: true });
           if (res.data) setMessages(res.data);
        }, 5000);

        (channel as any)._pollingInterval = intervalId;

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();

    return () => {
      if (channel) {
        if ((channel as any)._pollingInterval) clearInterval((channel as any)._pollingInterval);
        supabase.removeChannel(channel);
      }
    };
  }, []);

  useEffect(() => {
    if (!activeChatUserId || !currentUser) return;
    
    // Mark unread messages as read
    const unreadMessages = messages.filter(
      m => m.recipient_id === (currentUser.id || currentUser.user_id) && 
           m.sender_id === activeChatUserId && 
           !m.read_at
    );
    
    if (unreadMessages.length > 0) {
      const markAsRead = async () => {
        const now = new Date().toISOString();
        const promises = unreadMessages.map(m => 
          supabase
            .from("internal_messages")
            .update({ read_at: now })
            .eq("message_id", m.message_id)
        );
        await Promise.all(promises);
      };
      markAsRead();
    }
  }, [activeChatUserId, messages, currentUser]);

  const handleSendMessage = async () => {
    if ((!newMessageText.trim() && !attachedImage) || !activeChatUserId || !currentUser) return;
    setSending(true);
    try {
      const finalBody = attachedImage ? `${newMessageText.trim()}\n\n[ATTACHMENT]:${attachedImage}` : newMessageText.trim();
      const { data, error } = await supabase.from("internal_messages").insert({
        sender_id: currentUser.id || currentUser.user_id,
        recipient_id: activeChatUserId,
        body: finalBody,
        subject: "Message"
      }).select().single();
      
      if (error) {
        console.error(error);
        alert("Failed to send message: " + error.message);
      } else {
        setNewMessageText("");
        setAttachedImage(null);
        if (data) {
           setMessages(prev => {
              if (prev.find(m => m.message_id === data.message_id)) return prev;
              return [...prev, data].sort((a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime());
           });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const handleEditMessage = async (msgId: string) => {
    if (!editMessageText.trim()) return;
    try {
      const { error } = await supabase.from("internal_messages").update({ body: editMessageText.trim() }).eq("message_id", msgId);
      if (!error) {
         setMessages(prev => prev.map(m => m.message_id === msgId ? { ...m, body: editMessageText.trim() } : m));
         setEditingMessageId(null);
      } else {
         alert("Failed to edit message");
      }
    } catch(e) { console.error(e); }
  };

  const handleDeleteMessage = async (msgId: string) => {
    try {
      const { error } = await supabase.from("internal_messages").delete().eq("message_id", msgId);
      if (!error) {
        setMessages(prev => prev.filter(m => m.message_id !== msgId));
      } else {
        alert("Failed to delete message");
      }
    } catch(e) { console.error(e); }
  };

  const handleDeleteConversation = async () => {
    if (!activeChatUserId || !currentUser) return;
    try {
      const currentUserId = currentUser.id || currentUser.user_id;
      const { error } = await supabase.from('internal_messages')
        .delete()
        .or(`and(sender_id.eq.${currentUserId},recipient_id.eq.${activeChatUserId}),and(sender_id.eq.${activeChatUserId},recipient_id.eq.${currentUserId})`);
          
      if (!error) {
        setMessages(prev => prev.filter(m => !(
          (m.sender_id === currentUserId && m.recipient_id === activeChatUserId) ||
          (m.sender_id === activeChatUserId && m.recipient_id === currentUserId)
        )));
        setActiveChatUserId(null);
      } else {
        alert("Failed to clear conversation");
      }
    } catch(e) { console.error(e); }
  };

  const currentUserId = currentUser?.id || currentUser?.user_id;

  // Derive conversations from messages
  const conversationsMap = new Map();
  
  if (currentUserId) {
    messages.forEach(m => {
      if (m.sender_id === currentUserId || m.recipient_id === currentUserId) {
        const otherId = m.sender_id === currentUserId ? m.recipient_id : m.sender_id;
        if (!conversationsMap.has(otherId)) {
          conversationsMap.set(otherId, { unread: 0, lastMessage: '', time: '', messages: [] });
        }
        const conv = conversationsMap.get(otherId);
        conv.messages.push(m);
        conv.lastMessage = m.body;
        conv.time = "Recent"; // Mocking time since no created_at
        if (m.recipient_id === currentUserId && !m.read_at) {
          conv.unread += 1;
        }
      }
    });
  }

  // Also include all users so we can start new chats
  const conversationsList = allUsers
    .map(u => {
      const conv = conversationsMap.get(u.user_id);
      return {
        id: u.user_id,
        name: `${u.first_name} ${u.last_name}`,
        first_name: u.first_name || '',
        last_name: u.last_name || '',
        role: "User",
        role_names: u.role_names || [],
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop", // placeholder
        lastMessage: conv ? conv.lastMessage : "Start a conversation",
        time: conv ? conv.time : "",
        unread: conv ? conv.unread : 0,
        online: false,
        messages: conv ? conv.messages : [],
        hasHistory: !!conv
      };
    });

  conversationsList.sort((a, b) => {
    if (a.hasHistory && !b.hasHistory) return -1;
    if (!a.hasHistory && b.hasHistory) return 1;
    return a.name.localeCompare(b.name);
  });

  const filteredConversations = conversationsList.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (searchQuery.trim().length > 0) return matchesSearch;
    return c.hasHistory;
  });

  const activeConversation = conversationsList.find(c => c.id === activeChatUserId);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface-container-lowest rounded-3xl border border-outline-variant/30">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {/* Left Column: Chat List */}
      <div className={cn(
        "w-full lg:w-[380px] flex-col gap-4 lg:h-full shrink-0",
        (activeChatUserId !== null || showCompose) ? "hidden lg:flex" : "flex"
      )}>
         <div className="flex flex-col gap-3">
           <div className="flex items-center gap-2">
             <div className="flex-1 flex items-center gap-3 bg-surface-container-low rounded-2xl p-2 border border-outline-variant/30 relative">
               <Search className="w-5 h-5 text-on-surface-variant absolute left-3" />
               <input 
                 type="text" 
                 placeholder="Search recent chats..." 
                 className="w-full bg-transparent border-none outline-none font-body text-on-surface placeholder:text-on-surface-variant/50 pl-9"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
             </div>
             <button 
               onClick={fetchMessages}
               disabled={isRefreshing}
               className="p-2.5 bg-surface-container-low hover:bg-surface-variant border border-outline-variant/30 rounded-xl transition-colors shrink-0"
               title="Refresh Messages"
             >
               <RefreshCw className={cn("w-5 h-5 text-on-surface", isRefreshing && "animate-spin")} />
             </button>
             <button
               onClick={() => { setShowCompose(true); setActiveChatUserId(null); }}
               className="p-2.5 bg-primary text-on-primary hover:bg-primary/90 border border-transparent rounded-xl transition-colors shrink-0"
               title="Compose New Message"
             >
               <Edit2 className="w-5 h-5" />
             </button>
           </div>
         </div>

         <div className="flex-1 overflow-y-auto space-y-2 pr-2 hide-scrollbar">
            {filteredConversations.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-surface border border-outline-variant/30 rounded-3xl">
                  <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                     <Search className="w-8 h-8" />
                  </div>
                  <h3 className="font-label text-lg text-on-surface mb-2">No conversations found</h3>
                  <p className="font-body text-sm text-on-surface-variant">
                     {!searchQuery.trim() 
                        ? "Search for users above to start a new conversation." 
                        : "No users matched your search."}
                  </p>
               </div>
            ) : (
               filteredConversations.map((chat) => (
                  <button 
                    key={chat.id}
                    onClick={() => setActiveChatUserId(chat.id)}
                    className={cn(
                      "w-full flex items-start gap-3 p-4 rounded-2xl transition-all border outline-none text-left",
                      activeChatUserId === chat.id 
                        ? "bg-primary-container/10 border-primary-container/30 shadow-sm"
                        : "bg-surface hover:bg-surface-container-low border-transparent hover:border-outline-variant/30"
                    )}
                  >
                    <div className="relative shrink-0">
                       <div className="w-12 h-12 rounded-full border border-outline-variant/20 bg-primary-container text-on-primary-container font-bold flex items-center justify-center text-lg">
                          {chat.first_name?.[0]?.toUpperCase()}{chat.last_name?.[0]?.toUpperCase()}
                       </div>
                    </div>
                    <div className="flex-1 min-w-0 pr-1">
                       <div className="flex justify-between items-center mb-0.5">
                          <span className="font-label text-base font-bold text-on-surface truncate pr-2 flex items-baseline">
                             {chat.name}
                             {chat.role_names && chat.role_names.length > 0 && (
                                <span className="text-[11px] font-normal text-on-surface-variant ml-2 opacity-80 shrink-0">
                                   ({chat.role_names.map((r: string) => r.toLowerCase() === 'admin' ? 'School Admin' : r).join(', ')})
                                </span>
                             )}
                          </span>
                          {chat.unread > 0 && (
                             <span className="flex w-3 h-3 relative shrink-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full w-3 h-3 bg-primary"></span>
                             </span>
                          )}
                       </div>
                       <p className={cn("font-body tracking-wide text-sm truncate", chat.unread > 0 ? "text-on-surface font-semibold" : "text-on-surface-variant")}>
                          {chat.lastMessage}
                       </p>
                    </div>
                  </button>
               ))
            )}
         </div>
      </div>

      {/* Right Column: Active Chat */}
      {activeChatUserId !== null ? (
        <div className="flex-1 bg-surface-container-lowest rounded-3xl border border-outline-variant/40 shadow-sm flex flex-col h-[700px] lg:h-full lg:overflow-hidden relative">
           
           <div className="flex items-center justify-between p-4 md:p-6 border-b border-surface-variant shrink-0 bg-surface/50 backdrop-blur-md rounded-t-3xl">
              <div className="flex items-center gap-4">
                 <button className="lg:hidden p-2 -ml-2 rounded-full hover:bg-surface-variant/50 text-on-surface-variant" onClick={() => setActiveChatUserId(null)}>
                    <ChevronLeft className="w-6 h-6" />
                 </button>
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full border border-outline-variant/30 bg-primary-container text-on-primary-container font-bold flex items-center justify-center text-lg shrink-0">
                       {activeConversation?.first_name?.[0]?.toUpperCase()}{activeConversation?.last_name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                       <h3 className="font-label font-bold text-lg text-on-surface flex items-baseline gap-2">
                          {activeConversation?.name}
                          {activeConversation?.role_names && activeConversation.role_names.length > 0 && (
                             <span className="text-xs font-normal text-on-surface-variant opacity-80">
                                ({activeConversation.role_names.map((r: string) => r.toLowerCase() === 'admin' ? 'School Admin' : r).join(', ')})
                             </span>
                          )}
                       </h3>
                    </div>
                 </div>
              </div>
              <button 
                onClick={handleDeleteConversation}
                className="p-2 text-error hover:bg-error/10 rounded-full transition-colors"
                title="Clear Conversation"
              >
                <Trash2 className="w-5 h-5" />
              </button>
           </div>

           <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 flex flex-col">
              {activeConversation?.messages.length === 0 && (
                <div className="text-center text-on-surface-variant font-body py-10 opacity-70">
                  No messages yet. Send a message to start the conversation!
                </div>
              )}
              {activeConversation?.messages.map((msg: any) => {
                 const isMe = msg.sender_id === currentUserId;
                 const isEditing = editingMessageId === msg.message_id;
                 const bodyText = msg.body?.split?.('\n\n[ATTACHMENT]:')?.[0] || '';
                 const attachmentData = msg.body?.split?.('\n\n[ATTACHMENT]:')?.[1];

                 return (
                 <div key={msg.message_id} className={cn("flex flex-col max-w-[80%] group", isMe ? "self-end items-end" : "self-start items-start")}>
                    <div className={cn(
                       "p-4 rounded-2xl relative shadow-sm text-sm md:text-base leading-relaxed tracking-wide font-body whitespace-pre-wrap min-w-[120px]",
                       isMe 
                          ? "bg-primary text-on-primary rounded-tr-sm" 
                          : "bg-surface-container text-on-surface rounded-tl-sm border border-outline-variant/20"
                    )}>
                       {isEditing ? (
                         <div className="flex flex-col gap-3 min-w-[200px]">
                            <textarea 
                              className="w-full bg-surface-container-highest text-on-surface p-2 rounded-lg text-sm border-none outline-none resize-none"
                              value={editMessageText}
                              onChange={(e) => setEditMessageText(e.target.value)}
                              rows={2}
                            />
                            <div className="flex justify-end gap-2">
                               <button onClick={() => setEditingMessageId(null)} className="text-xs px-3 py-1.5 bg-surface-variant hover:bg-surface text-on-surface rounded-md">Cancel</button>
                               <button onClick={() => handleEditMessage(msg.message_id)} className="text-xs px-3 py-1.5 bg-primary-container text-on-primary-container hover:brightness-110 rounded-md">Save</button>
                            </div>
                         </div>
                       ) : (
                         <>
                           {bodyText}
                           {attachmentData && (
                             <img src={attachmentData} alt="attachment" className="mt-3 max-h-64 rounded-xl object-contain bg-black/5" />
                           )}
                           {isMe && (
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-sm rounded-lg flex items-center p-1 gap-1">
                                <button onClick={() => { setEditingMessageId(msg.message_id); setEditMessageText(bodyText); }} className="p-1 hover:bg-white/20 rounded-md text-white transition-colors" title="Edit">
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => handleDeleteMessage(msg.message_id)} className="p-1 hover:bg-white/20 rounded-md text-white transition-colors" title="Delete">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                           )}
                         </>
                       )}
                    </div>
                 </div>
              )})}
           </div>

           <div className="p-4 md:p-6 border-t border-surface-variant bg-surface-container-lowest shrink-0 rounded-b-3xl">
              {attachedImage && (
                <div className="mb-3 relative inline-block">
                   <img src={attachedImage} alt="attachment preview" className="h-24 w-auto rounded-lg border border-outline-variant/30 object-cover" />
                   <button onClick={() => setAttachedImage(null)} className="absolute -top-2 -right-2 bg-surface text-on-surface p-1 rounded-full border border-outline-variant/30 shadow-sm hover:bg-surface-variant transition-colors">
                      <X className="w-4 h-4" />
                   </button>
                </div>
              )}
              <div className="flex items-end gap-2 md:gap-4 bg-surface rounded-2xl p-2 border border-outline-variant/40 focus-within:border-primary/50 transition-colors shadow-sm">
                 <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleAttachImage} />
                 <button onClick={() => fileInputRef.current?.click()} className="p-2 md:p-3 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-xl transition-colors shrink-0 mb-0.5 ml-0.5">
                    <ImageIcon className="w-6 h-6" />
                 </button>
                 <textarea 
                    className="flex-1 bg-transparent border-none outline-none resize-none font-body text-base py-3 px-2 max-h-32 hide-scrollbar"
                    placeholder="Type a message..."
                    rows={1}
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                 ></textarea>
                 <button 
                   onClick={handleSendMessage}
                   disabled={sending || (!newMessageText.trim() && !attachedImage)}
                   className="p-3 bg-primary text-on-primary rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm shrink-0 mb-0.5 mr-0.5">
                    {sending ? <Loader2 className="w-5 h-5 animate-spin ml-1" /> : <Send className="w-5 h-5 ml-1" />}
                 </button>
              </div>
           </div>

        </div>
      ) : (
         <div className={cn("hidden lg:flex flex-1 items-center justify-center bg-surface-container-lowest rounded-3xl border border-outline-variant/30", showCompose ? "!flex lg:!flex" : "")}>
            <div className="text-center flex flex-col items-center gap-4 w-full max-w-md p-8">
               <div className="w-16 h-16 bg-surface-variant rounded-full flex items-center justify-center text-on-surface-variant mb-2">
                  <Edit2 className="w-8 h-8 opacity-50" />
               </div>
               <h3 className="font-label text-xl text-on-surface">Compose Message</h3>
               <p className="font-body text-on-surface-variant mb-6">Select a user below to start a conversation</p>
               
               <div className="w-full text-left relative">
                  <label className="block text-sm font-medium text-on-surface-variant mb-2">Select Recipient</label>
                  <select 
                    className="w-full bg-surface border border-outline-variant rounded-xl p-3 text-on-surface outline-none focus:border-primary transition-colors appearance-none pr-10"
                    value=""
                    onChange={(e) => {
                       setActiveChatUserId(e.target.value);
                       setShowCompose(false);
                    }}
                  >
                    <option value="" disabled>Choose a user...</option>
                    {(() => {
                      const rolesList = new Set<string>();
                      allUsers.forEach(u => {
                        (u.role_names || []).forEach((r: string) => rolesList.add(r));
                      });
                      const desiredOrder = ['Admin', 'Teacher', 'Student', 'Parent', 'Volunteer', 'Staff', 'Builder'];
                      const sortedRoles = Array.from(rolesList).sort((a, b) => {
                        const idxA = desiredOrder.indexOf(a);
                        const idxB = desiredOrder.indexOf(b);
                        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                        if (idxA !== -1) return -1;
                        if (idxB !== -1) return 1;
                        return a.localeCompare(b);
                      });
                      const finalRoles = [...sortedRoles, "Others"];
                      
                      return finalRoles.map(r => {
                          const group = allUsers.filter(u => {
                            const userRoles = u.role_names || [];
                            if (r === "Others") return userRoles.length === 0;
                            return userRoles.includes(r);
                          });
                          
                          if (group.length === 0) return null;
                          
                          // Sort group by last name alphabetically
                          group.sort((a, b) => (a.last_name || '').localeCompare(b.last_name || ''));
                          
                          return (
                            <optgroup key={r} label={r === "Others" ? "Unassigned" : (r === "Admin" ? "School Admin" : (r === "Teacher" ? "Teachers" : (r === "Student" ? "Students" : (r === "Parent" ? "Parents" : r))))}>
                                {group.map(u => (
                                  <option key={u.user_id} value={u.user_id}>
                                      {u.first_name} {u.last_name}
                                  </option>
                                ))}
                            </optgroup>
                          );
                      });
                    })()}
                  </select>
                  <ChevronDown className="absolute right-4 top-[38px] w-5 h-5 text-on-surface-variant pointer-events-none" />
               </div>

               {showCompose && (
                  <button 
                    onClick={() => setShowCompose(false)} 
                    className="mt-6 text-sm text-on-surface-variant hover:text-on-surface underline lg:hidden"
                  >
                    Cancel
                  </button>
               )}
            </div>
         </div>
      )}
    </>
  );
}
