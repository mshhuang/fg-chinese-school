import React, { useState, useEffect, useRef } from "react";
import { Settings, Megaphone, Search, Filter, Plus, Clock, Users, Reply, X, Loader2, MessageSquare, Send, BookOpen, GraduationCap, User, Home, Briefcase, Heart, Wrench, Sparkles, Edit2, Trash2, Paperclip, ChevronDown, ChevronUp, UserSquare2, Check } from "lucide-react";
import { cn, formatTeacherName } from "../lib/utils";
import { useLanguage } from "../lib/i18n";
import { fetchVisibleAnnouncements } from "../lib/announcementUtils";
import { supabase } from "../lib/supabase";
import { BuilderIconCustom, AdminIconCustom, StaffIconCustom, VolunteerIconCustom, TeacherIconCustom, StudentIconCustom } from "../components/icons";
import { logSystemActivity } from "../lib/logger";
import { Video, Link as LinkIcon, Image as ImageIcon, Smile } from "lucide-react";
import { RichTextEditor } from "../components/RichTextEditor";


const getRealUserId = (id: string | null | undefined) => {
    if (!id) return null;
    if (id === 'demo' || id === 'builder_secret') return 'c4d458f8-ba08-4fc1-bbbf-c4c1eac64068';
    return id;
};

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Compose Modal UI
  const [showCompose, setShowCompose] = useState(false);
  const { t } = useLanguage();
  const [composeTitle, setComposeTitle] = useState("");
  const [composeContent, setComposeContent] = useState("");
  const [composeAttachments, setComposeAttachments] = useState<{name: string, url: string}[]>([]);
  const [isSystemAnnouncement, setIsSystemAnnouncement] = useState(false);
  const [audienceMode, setAudienceMode] = useState("all"); // 'all', 'roles', 'classes', 'users'
  const [targetRoleIds, setTargetRoleIds] = useState<number[]>([]);
      const [targetClassIds, setTargetClassIds] = useState<string[]>([]);
  const [targetUserIds, setTargetUserIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPostingRole, setSelectedPostingRole] = useState<string>("");

  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
       alert("File is too large. Max 10MB allowed.");
       return;
    }
    setIsSubmitting(true);
    try {
        const ext = file.name.split('.').pop() || 'file';
        const safeName = file.name.replace(/[^a-zA-Z0-9.-_]/g, '').substring(0, 30);
        const filePath = `announcements/${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${safeName}`;
        
        const { error: uploadError } = await supabase.storage
            .from('announcements')
            .upload(filePath, file, { cacheControl: '3600', upsert: false });
            
        if (!uploadError) {
            const { data } = supabase.storage.from('announcements').getPublicUrl(filePath);
            setComposeAttachments(prev => [...prev, { name: file.name, url: data.publicUrl }]);
        } else {
            console.error("Storage upload failed:", uploadError);
            alert("Could not upload file: " + uploadError.message);
        }
    } catch (err) {
        console.error("Upload error", err);
        alert("Failed to upload the file.");
    } finally {
        setIsSubmitting(false);
    }
    e.target.value = '';
  };

  // Read State
  const [readState, setReadState] = useState<Record<string, { read_at: number, replies: number }>>({});
  const [readCounts, setReadCounts] = useState<Record<string, number>>({});

  // Quick Reply (Inline) UI
  const [replyBody, setReplyBody] = useState<Record<string, string>>({});
  const [isReplying, setIsReplying] = useState<Record<string, boolean>>({});

  // Accordion State
  const [expandedAnns, setExpandedAnns] = useState<Record<string, boolean>>({});

  const toggleAccordion = (id: string, replies: any[]) => {
      setExpandedAnns(prev => ({ ...prev, [id]: !prev[id] }));
      markAsRead(id, replies);
  };

  // Edit/Delete State
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);
  const [editAnnTitleStr, setEditAnnTitleStr] = useState("");
  const [editAnnContentStr, setEditAnnContentStr] = useState("");
  const [editAudienceMode, setEditAudienceMode] = useState("all");
  const [editTargetRoleIds, setEditTargetRoleIds] = useState<string[]>([]);
  const [editTargetClassIds, setEditTargetClassIds] = useState<string[]>([]);
  const [editTargetUserIds, setEditTargetUserIds] = useState<string[]>([]);
  const [editUserSearchQuery, setEditUserSearchQuery] = useState("");

  
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editReplyContentStr, setEditReplyContentStr] = useState("");
  
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | number | null>(null);
  const [confirmCommentDeleteId, setConfirmCommentDeleteId] = useState<string | number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (user?.id) {
       supabase.from('read_receipts').select('*').eq('user_id', getRealUserId(user.id)).eq('item_type', 'announcement')
         .then(({ data }) => {
             if (data) {
                 const newReadState: Record<string, any> = {};
                 data.forEach(r => {
                     newReadState[r.item_id] = { read_at: new Date(r.read_at).getTime() };
                 });
                 setReadState(newReadState);
             }
         });
    }
  }, [user?.id]);

  const markAsRead = async (annId: string, replies: any[]) => {
      const latestReplyTime = replies.length > 0 ? Math.max(...replies.map(r => new Date(r.created_at).getTime())) : 0;
      
      setReadState(prev => {
          const current = prev[annId];
          const hasNew = !current || (latestReplyTime > 0 && current.read_at < latestReplyTime);
          if (!hasNew) return prev; // Already read up to latest
          
          const next = { ...prev, [annId]: { read_at: Date.now(), replies: replies.length } };
          
          if (user?.id) {
              supabase.from('read_receipts').upsert({
                  user_id: getRealUserId(user.id),
                  item_type: 'announcement',
                  item_id: annId,
                  read_at: new Date().toISOString()
              }, { onConflict: 'user_id, item_type, item_id' }).then(() => {
                 window.dispatchEvent(new Event('ann_read_updated'));
              });
          }
          return next;
      });
  };

  const getPrimaryRole = (userObj: any) => {
      if (!userObj) return 'student';
      if (userObj.user_roles && userObj.user_roles.length > 0) {
          const roles = userObj.user_roles.map((ur: any) => ur.roles?.role_name?.toLowerCase()).filter(Boolean);
          if (roles.includes('admin')) return 'admin';
          if (roles.includes('builder')) return 'builder';
          if (roles.includes('teacher')) return 'teacher';
          if (roles.includes('staff')) return 'staff';
          if (roles.includes('volunteer')) return 'volunteer';
          if (roles.includes('parent')) return 'parent';
          return roles[0] || 'student';
      }
      return 'student';
  };

  const getRoleIcon = (roleName: string, sizeClass: string) => {
      switch (roleName) {
          case 'System': return <Settings className={sizeClass} />;
          case 'admin':
          case 'principal': return <AdminIconCustom className={sizeClass} />;
          case 'builder': return <BuilderIconCustom className={sizeClass} />;
          case 'teacher': return <TeacherIconCustom className={sizeClass} />;
          case 'parent': return <Home className={sizeClass} />;
          case 'staff': return <StaffIconCustom className={sizeClass} />;
          case 'volunteer': return <VolunteerIconCustom className={sizeClass} />;
          case 'student':
          default: return <StudentIconCustom className={sizeClass} />;
      }
  };

    const fetchData = async () => {
    try {
      const userStr = localStorage.getItem('user');
      let currentUserId = null;
      let currentUserRole = "student";
      let u = null;
      
      if (userStr) {
        try {
          u = JSON.parse(userStr);
          setUser(u);
          currentUserId = u.id;
          currentUserRole = localStorage.getItem('current_role') || u.role || 'student';
          setSelectedPostingRole(u.role || 'student');
        } catch (e) {
          console.error('JSON parse error', e);
        }
      }

      // Load announcements immediately
      const parsedUser = userStr ? JSON.parse(userStr) : user;
      
      const [finalAnns, rolesRes, classesRes] = await Promise.all([
          fetchVisibleAnnouncements({ ...parsedUser, id: getRealUserId(parsedUser.id) }, currentUserRole),
          supabase.from('roles').select('*'),
          supabase.from('classes').select('class_id, class_name')
      ]);
      
      // Load users for the compose dropdown in the background
      supabase.from('users').select('user_id, first_name, last_name, email, user_roles(roles(role_name))').then(({data, error}) => {
          if (!error && data) {
              const formattedUsers = data.map(u => ({
                  ...u,
                  role_names: (u.user_roles || []).map((ur: any) => ur.roles?.role_name).filter(Boolean)
              })).filter((u: any) => !(u.first_name === 'Youlin' && u.last_name === 'Venerable'));
              setAvailableUsers(formattedUsers);
          }
      });
      
      if (rolesRes.error) console.error('rolesRes err', rolesRes.error);
      if (classesRes.error) console.error('classesRes err', classesRes.error);

      if (rolesRes.data) {
        setRoles(rolesRes.data);
      }
      if (classesRes.data) setClasses(classesRes.data);

      setAnnouncements(finalAnns || []);
      setLoading(false);
      
      if (finalAnns && finalAnns.length > 0) {
          const ids = finalAnns.map(a => a.announcement_id);
          supabase.from('read_receipts').select('item_id').eq('item_type', 'announcement').in('item_id', ids).then(({data: rcData}) => {
              if (rcData) {
                  const counts: any = {};
                  rcData.forEach((r: any) => {
                      counts[r.item_id] = (counts[r.item_id] || 0) + 1;
                  });
                  setReadCounts(counts);
              }
          });
      }
    } catch(err) {
      console.error('Error fetching announcements:', err);
      setLoading(false);
    }
  };

  const toggleMultiSelect = (setter: React.Dispatch<React.SetStateAction<any[]>>, val: any) => {
      setter(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  };

  
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (user?.id === 'demo' || user?.id === 'builder_secret') {
       alert('Simulating announcement creation for demo user.');
       setIsSubmitting(false);
       setShowCompose(false);
       return;
    }

    let encodedContent = isSystemAnnouncement ? `$$_is_system:true_$$${composeContent}` : (selectedPostingRole ? `$$_role:${selectedPostingRole}_$$${composeContent}` : composeContent);
    if (composeAttachments.length > 0) {
        encodedContent += `\n\n---ATTACHMENTS---\n${JSON.stringify(composeAttachments)}`;
    }

    const payload = {
       title: composeTitle,
       content: encodedContent,
       created_by: getRealUserId(user?.id),
       target_role_ids: audienceMode === 'roles' ? targetRoleIds : [],
       target_class_ids: audienceMode === 'classes' ? targetClassIds : [],
       target_user_ids: audienceMode === 'users' ? targetUserIds : [],
       expires_at: null
    };

    const { data, error } = await supabase.from('announcements').insert(payload).select().single();

    if (!error) {
       logSystemActivity(
           "Announcements",
           "/announcements",
           `Created announcement: ${composeTitle}`,
           "create",
           payload
       );
       setShowCompose(false);
       setComposeTitle("");
       setComposeContent("");
       setComposeAttachments([]);
       setIsSystemAnnouncement(false);
       setAudienceMode("all");
       setTargetRoleIds([]);
       setTargetClassIds([]);
       setTargetUserIds([]);
       fetchData(); // Refresh to get relations
    } else {
       alert("Failed to create announcement: " + error.message);
    }
    setIsSubmitting(false);
  };

  const handleReplySubmit = async (announcementId: string) => {
    const content = replyBody[announcementId];
    if (!content?.trim()) return;

    if (user?.id === 'demo' || user?.id === 'builder_secret') {
       alert('Simulating reply for demo user.');
       setReplyBody(prev => ({...prev, [announcementId]: ""}));
       return;
    }

    setIsReplying(prev => ({...prev, [announcementId]: true}));

    const { error } = await supabase.from('announcement_replies').insert({
       announcement_id: announcementId,
       user_id: getRealUserId(user?.id),
       content: content.trim()
    });

    if (!error) {
       logSystemActivity(
           "Announcements",
           "/announcements",
           "Replied to an announcement",
           "create",
           { announcement_id: announcementId, reply: content.trim() }
       );

       setReplyBody(prev => ({...prev, [announcementId]: ""}));
       fetchData(); // refresh to get new reply
    } else {
       alert("Failed to send reply: " + error.message);
    }
    setIsReplying(prev => ({...prev, [announcementId]: false}));
  };

  const handleDeleteAnnouncement = async (annId: string, confirmed: boolean = false) => {
      if (!confirmed) return;
      await supabase.from('announcement_replies').delete().eq('announcement_id', annId);
      await supabase.from('announcements').delete().eq('announcement_id', annId);
      setConfirmDeleteId(null);
      
      logSystemActivity(
         "Announcements",
         "/announcements",
         "Deleted an announcement",
         "delete",
         { announcement_id: annId }
      );
      fetchData();
  };

  const handleEditAnnouncementSub = async (annId: string, authorRole: string, isSystem: boolean, attachments: any[]) => {
      if (!editAnnContentStr.trim()) return;
      let encodedContent = editAnnContentStr;
      if (isSystem) {
          encodedContent = `$$_is_system:true_$$${editAnnContentStr}`;
      } else {
          const finalRole = selectedPostingRole || authorRole;
          encodedContent = `$$_role:${finalRole}_$$${editAnnContentStr}`;
      }
      if (attachments && attachments.length > 0) {
          encodedContent += `\n\n---ATTACHMENTS---\n${JSON.stringify(attachments)}`;
      }
      await supabase.from('announcements').update({ 
          title: editAnnTitleStr, 
          content: encodedContent,
          target_role_ids: editAudienceMode === 'roles' ? editTargetRoleIds : [],
          target_class_ids: editAudienceMode === 'classes' ? editTargetClassIds : [],
          target_user_ids: editAudienceMode === 'users' ? editTargetUserIds : [],
          target_role_id: null
      }).eq('announcement_id', annId);
      
      logSystemActivity(
         "Announcements",
         "/announcements",
         "Edited an announcement",
         "update",
         { announcement_id: annId, title: editAnnTitleStr }
      );

      setEditingAnnId(null);
      fetchData();
  };

  const handleDeleteReply = async (replyId: string, confirmed: boolean = false) => {
      if (!confirmed) return;
      await supabase.from('announcement_replies').delete().eq('reply_id', replyId);
      setConfirmCommentDeleteId(null);
      fetchData();
  };

  const handleEditReplySub = async (replyId: string) => {
      if (!editReplyContentStr.trim()) return;
      await supabase.from('announcement_replies').update({ content: editReplyContentStr }).eq('reply_id', replyId);
      setEditingReplyId(null);
      fetchData();
  };

  const canCreate = user?.role === 'admin' || user?.role === 'principal' || user?.role === 'teacher' || user?.role === 'builder' || user?.role === 'staff';

  const extractAudienceStr = (ann: any) => {
      let auds = [];
      if (ann.target_role_ids?.length > 0) auds.push(ann.target_role_ids.length + " Roles");
      if (ann.target_class_ids?.length > 0) auds.push(ann.target_class_ids.length + " Classes");
      if (ann.target_user_ids?.length > 0) auds.push(ann.target_user_ids.length + " Users");
      if (ann.target_role_id) { const r = roles.find(r => r.role_id === ann.target_role_id); if (r) auds.push(r.role_name); }
      
      if (auds.length > 0) return auds.join(', ');
      return "All Audiences";
  };

  const extractAudienceFilter = (ann: any) => {
      if (ann.target_role_ids?.length > 0) return "Targeted Roles";
      if (ann.target_class_ids?.length > 0) return "Targeted Classes";
      if (ann.target_user_ids?.length > 0) return "Targeted Users";
      if (ann.target_role_id) { const r = roles.find(r => r.role_id === ann.target_role_id); if (r) return r.role_name; }
      return "All Audiences";
  }

  const dynamicFilters = ["All", "Targeted Roles", "Targeted Classes", "Targeted Users", "All Audiences"];

  const filteredAnnouncements = announcements.filter(a => {
    const titleMatch = a.title ? a.title.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    const contentMatch = a.content ? a.content.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    const matchesSearch = titleMatch || contentMatch;
    const aud = extractAudienceFilter(a);
    const matchesFilter = activeFilter === "All" || aud === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="w-full max-w-[1600px] mx-auto p-6 md:p-8 flex flex-col gap-8 pb-32 md:pb-8 relative">
       <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div>
           <h1 className="font-display text-4xl text-primary font-bold tracking-tight">{t("Announcements")}</h1>
           <p className="font-body text-lg text-on-surface-variant mt-2">
             {canCreate ? t("Create and manage broadcast communications.") : t("Read the latest updates from your school.")}
           </p>
         </div>
         {canCreate && (
             <button 
                onClick={() => setShowCompose(true)}
                className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-label font-bold hover:bg-primary/90 transition-colors shadow-md w-full md:w-auto justify-center">
                <Plus className="w-5 h-5" /> {t("New Announcement")}
             </button>
         )}
       </header>

       <div className="flex flex-col xl:flex-row justify-between gap-6">
          <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar w-full xl:w-auto">
             {Array.from(new Set(dynamicFilters)).map(aud => (
                <button
                  key={aud}
                  onClick={() => setActiveFilter(aud)}
                  className={cn(
                    "whitespace-nowrap px-6 py-2.5 rounded-full font-label text-sm transition-all border font-bold shrink-0",
                    activeFilter === aud 
                      ? "bg-primary-container text-on-primary-container border-primary-container shadow-sm" 
                      : "bg-surface text-on-surface-variant border-outline-variant/40 hover:bg-surface-variant/50"
                  )}
                >
                   {t(aud)}
                </button>
             ))}
          </div>

          <div className="flex items-center gap-3 bg-surface-container-low rounded-full px-4 py-2 border border-outline-variant/40 shrink-0 w-full xl:w-80 shadow-sm focus-within:border-primary/50 transition-colors">
             <Search className="w-5 h-5 text-on-surface-variant" />
             <input 
               type="text" 
               placeholder={t("Search announcements...")} 
               className="bg-transparent border-none outline-none font-body text-sm w-full"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
          </div>
       </div>

       {loading ? (
           <div className="flex justify-center items-center py-20">
               <Loader2 className="w-8 h-8 animate-spin text-primary" />
           </div>
       ) : (
           <div className="max-w-6xl flex flex-col gap-6 w-full">
              {filteredAnnouncements.map(ann => {
                  const isTeacher = ann.users?.user_roles?.some((ur: any) => ur.roles?.role_name === 'Teacher');
                  
                  let displayContent = ann.content || "";
                  let authorRole = getPrimaryRole(ann.users);
                  let isSystem = false;
                  if (/\$\$_is_system:true_?\$\$/is.test(displayContent)) {
                      isSystem = true;
                      authorRole = "System";
                      displayContent = displayContent.replace(/\$\$_is_system:true_?\$\$\s*/is, '');
                  }

                  const authorName = isSystem ? "System Announcement" : (ann.users ? (isTeacher ? formatTeacherName(ann.users.first_name, ann.users.last_name) : `${ann.users.first_name} ${ann.users.last_name}`) : "System / Unknown");
                  const audienceInfo = extractAudienceStr(ann);
                  const replies = [...(ann.announcement_replies || [])].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                  
                  // Match $$_role: Role_$$ Content... or slightly malformed variants
                  const roleMatch = displayContent.match(/\$\$_role:\s*(.*?)\s*(?:_\$\$|\$\$)\s*(.*)/is);
                  if (roleMatch) {
                      authorRole = roleMatch[1].trim() || authorRole;
                      displayContent = roleMatch[2];
                  }

                  let attachments: any[] = [];
                  const attachMatch = displayContent.match(/\n*---ATTACHMENTS---\n*([\s\S]*)/);
                  if (attachMatch) {
                      displayContent = displayContent.substring(0, attachMatch.index);
                      try {
                          attachments = JSON.parse(attachMatch[1]);
                      } catch(e){}
                  }

                  const isNew = ann.created_by !== getRealUserId(user?.id) && !readState[ann.announcement_id];
                  const latestReplyTime = replies.length > 0 ? Math.max(...replies.map((r: any) => new Date(r.created_at).getTime())) : 0;
                  const hasNewReplies = readState[ann.announcement_id] && latestReplyTime > 0 ? readState[ann.announcement_id].read_at < latestReplyTime : false;

                  const isExpanded = expandedAnns[ann.announcement_id];
                  return (
                     <div 
                        key={ann.announcement_id} 
                        className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30  flex flex-col hover:shadow-md transition-all shadow-sm overflow-hidden"
                     >
                         <div className="p-6 cursor-pointer hover:bg-surface-variant/20 transition-colors" onClick={() => toggleAccordion(ann.announcement_id, replies)}>
                             <div className="flex justify-between items-start mb-4">
                                 <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg">
                                         {getRoleIcon(authorRole, "w-8 h-8")}
                                     </div>
                                     <div>
                                        <h3 className="text-2xl font-bold text-on-surface flex items-center gap-2">
                                           {ann.title ? ann.title : authorName}
                                           {isNew && <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-primary text-on-primary font-bold uppercase tracking-wider"><Sparkles className="w-3 h-3 animate-pulse"/> New</span>}
                                           {!isNew && hasNewReplies && <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-secondary text-on-secondary font-bold uppercase tracking-wider"><Sparkles className="w-3 h-3 animate-pulse"/> New Replies</span>}
                                        </h3>
                                        
                                        <p className="text-sm text-on-surface-variant font-medium mt-1">
                                           {ann.title ? <span className="font-bold mr-2 text-on-surface">{authorName}</span> : null}
                                           {new Date(ann.created_at || Date.now()).toLocaleDateString('en-US', { timeZone: 'America/New_York' })} • 
                                           <Users className="w-3 h-3 inline ml-1 mr-0.5"/> To: {audienceInfo}
                                           {(user?.role === 'admin' || user?.role === 'builder' || user?.role === 'teacher' || ann.created_by === getRealUserId(user?.id)) && (
                                               <span className="ml-2 inline-flex items-center gap-1 text-primary" title="Total unique reads">
                                                   <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                                   {readCounts[ann.announcement_id.toString()] || 0} read
                                               </span>
                                           )}
                                        </p>

                                     </div>
                                 </div>
                                 <div className="flex items-center gap-4">
                                     {(user?.role === 'builder' || ann.created_by === getRealUserId(user?.id)) && (
                                     <div className="flex items-center gap-2">
                                         <button 
                                            onClick={() => {
                                                setEditingAnnId(ann.announcement_id); 
                                                setEditAnnTitleStr(ann.title); 
                                                setEditAnnContentStr(displayContent);
                                                
                                                if (ann.target_role_ids?.length > 0 || ann.target_role_id) {
                                                    setEditAudienceMode('roles');
                                                    setEditTargetRoleIds(ann.target_role_ids?.length ? ann.target_role_ids : [ann.target_role_id].filter(Boolean));
                                                    setEditTargetClassIds([]);
                                                    setEditTargetUserIds([]);
                                                } else if (ann.target_class_ids?.length > 0) {
                                                    setEditAudienceMode('classes');
                                                    setEditTargetClassIds(ann.target_class_ids);
                                                    setEditTargetRoleIds([]);
                                                    setEditTargetUserIds([]);
                                                } else if (ann.target_user_ids?.length > 0) {
                                                    setEditAudienceMode('users');
                                                    setEditTargetUserIds(ann.target_user_ids);
                                                    setEditTargetRoleIds([]);
                                                    setEditTargetClassIds([]);
                                                } else {
                                                    setEditAudienceMode('all');
                                                    setEditTargetRoleIds([]);
                                                    setEditTargetClassIds([]);
                                                    setEditTargetUserIds([]);
                                                }

                                            }}
                                            className="px-3 py-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-full transition-colors flex items-center gap-1.5"
                                         >
                                             <Edit2 className="w-4 h-4" />
                                             <span className="text-xs font-bold">Edit</span>
                                         </button>
                                         {confirmDeleteId === ann.announcement_id ? (
                                             <div className="flex items-center gap-1">
                                                 <button onClick={() => setConfirmDeleteId(null)} className="text-xs font-bold text-on-surface-variant hover:text-on-surface px-2 py-1">Cancel</button>
                                                 <button onClick={() => handleDeleteAnnouncement(ann.announcement_id, true)} className="text-xs font-bold text-error bg-error/10 hover:bg-error/20 px-3 py-1 rounded-full">Delete</button>
                                             </div>
                                         ) : (
                                             <button 
                                                onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(ann.announcement_id); }}
                                                className="px-3 py-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-full transition-colors flex items-center gap-1.5"
                                             >
                                                 <Trash2 className="w-4 h-4" />
                                                 <span className="text-xs font-bold">Delete</span>
                                             </button>
                                         )}
                                     </div>
                                 )}
                                     <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant/50 transition-colors">
                                         {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                                     </button>
                                 </div>
                             </div>
                             
                             {isExpanded && (
                               <div onClick={(e) => e.stopPropagation()} className="cursor-auto pt-2">
                             {editingAnnId === ann.announcement_id ? (
                                 <div className="flex flex-col gap-3 py-2">
                                     <input 
                                         className="w-full px-4 py-2 bg-surface rounded-xl border border-outline-variant/50 focus:border-primary font-bold text-lg outline-none"
                                         value={editAnnTitleStr} onChange={(e) => setEditAnnTitleStr(e.target.value)}
                                     />
                                     <div className="bg-surface rounded-xl border border-outline-variant/50 ">
                                       <RichTextEditor value={editAnnContentStr} onChange={setEditAnnContentStr} className="h-[400px]" />
                                     </div>
                                     {user?.availableRoles && user.availableRoles.length > 1 && (
                                         <div className="mt-2">
                                             <label className="block font-label text-sm uppercase tracking-wider font-bold text-on-surface-variant mb-2">Change Posting Role</label>
                                             <div className="flex gap-2 flex-wrap">
                                                 {user.availableRoles.map((r: string) => (
                                                     <button
                                                         key={r}
                                                         type="button"
                                                         onClick={() => setSelectedPostingRole(r)}
                                                         className={cn(
                                                             "px-3 py-1.5 rounded-lg font-label text-xs font-bold capitalize transition-all border",
                                                             selectedPostingRole === r || (!selectedPostingRole && authorRole === r)
                                                               ? "bg-primary text-on-primary border-primary"
                                                               : "bg-surface text-on-surface hover:bg-surface-variant border-outline-variant/30"
                                                         )}
                                                     >
                                                         {r}
                                                     </button>
                                                 ))}
                                             </div>
                                         </div>
                                     )}

                                     <div className="mt-4">
                                         <label className="block font-label text-sm uppercase tracking-wider font-bold text-on-surface-variant mb-3">Change Audience</label>
                                         <div className="flex flex-wrap gap-2 mb-4">
                                            {['all', 'roles', 'classes', 'users'].map(mode => (
                                                <button
                                                    key={mode}
                                                    type="button"
                                                    onClick={() => setEditAudienceMode(mode)}
                                                    className={cn(
                                                        "px-4 py-2 rounded-full font-label text-xs font-bold capitalize transition-colors border",
                                                        editAudienceMode === mode
                                                           ? "bg-primary text-on-primary border-primary"
                                                           : "bg-surface border-outline-variant/50 text-on-surface-variant hover:bg-surface-variant"
                                                    )}
                                                >
                                                    {mode === 'all' ? t('Everyone') : t('Specific ' + mode)}
                                                </button>
                                            ))}
                                         </div>
                                         <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 text-sm max-h-48 overflow-y-auto">
                                             {editAudienceMode === 'all' && (
                                                 <p className="text-on-surface-variant">This announcement will be visible to everyone.</p>
                                             )}
                                             
                                             {editAudienceMode === 'roles' && (
                                                 <div className="grid grid-cols-2 gap-3">
                                                     {roles.map(r => (
                                                         <label key={r.role_id} className="flex items-center gap-2 cursor-pointer text-on-surface">
                                                             <input
                                                                 type="checkbox"
                                                                 className="rounded border-outline-variant/50 text-primary focus:ring-primary"
                                                                checked={editTargetRoleIds.includes(r.role_id)}
                                                                onChange={() => toggleMultiSelect(setEditTargetRoleIds, r.role_id)}
                                                             />
                                                             {r.role_name}
                                                         </label>
                                                     ))}
                                                 </div>
                                             )}
                                             {editAudienceMode === 'classes' && (
                                                 <div className="grid grid-cols-2 gap-3">
                                                     {classes.length === 0 ? <p className="text-on-surface-variant">No classes available.</p> : classes.map(c => (
                                                         <label key={c.class_id} className="flex items-center gap-2 cursor-pointer text-on-surface">
                                                             <input
                                                                 type="checkbox"
                                                                 className="rounded border-outline-variant/50 text-primary focus:ring-primary"
                                                                checked={editTargetClassIds.includes(c.class_id)}
                                                                onChange={() => toggleMultiSelect(setEditTargetClassIds, c.class_id)}
                                                             />
                                                             {c.class_name}
                                                         </label>
                                                     ))}
                                                 </div>
                                             )}
                                             {editAudienceMode === 'users' && (
                                                 <div className="flex flex-col gap-3">
                                                     <div className="relative">
                                                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50" />
                                                         <input 
                                                             type="text" 
                                                             placeholder="Search users to tag..."
                                                             value={editUserSearchQuery}
                                                             onChange={(e) => setEditUserSearchQuery(e.target.value)}
                                                             className="w-full pl-9 pr-4 py-2 bg-surface rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body text-sm"
                                                         />
                                                     </div>
                                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                         {availableUsers
                                                             .filter(u => `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(editUserSearchQuery.toLowerCase()))
                                                             .slice(0, 10)
                                                             .map(u => {
                                                                 const isSelected = editTargetUserIds.includes(u.user_id);
                                                                 const getPrimaryRole = (roles: string[]) => {
                                                                     if (!roles || roles.length === 0) return 'Others';
                                                                     const priority = ['Admin', 'Principal', 'Teacher', 'Staff', 'Parent', 'Student'];
                                                                     let bestIdx = 999;
                                                                     for (const r of roles) {
                                                                         const idx = priority.indexOf(r);
                                                                         if (idx !== -1 && idx < bestIdx) bestIdx = idx;
                                                                     }
                                                                     if (bestIdx === 999) return roles[0];
                                                                     return priority[bestIdx];
                                                                 };
                                                                 return (
                                                                     <div 
                                                                         key={u.user_id} 
                                                                         onClick={() => toggleMultiSelect(setEditTargetUserIds, u.user_id)}
                                                                         className={cn(
                                                                             "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors",
                                                                             isSelected ? "bg-primary/10 border-primary shadow-sm" : "bg-surface border-outline-variant/50 hover:bg-surface-variant"
                                                                         )}
                                                                     >
                                                                         <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center shrink-0">
                                                                             <UserSquare2 className="w-4 h-4 text-on-surface-variant" />
                                                                         </div>
                                                                         <div className="flex-1 min-w-0">
                                                                             <p className="font-title text-sm font-bold text-on-surface truncate">{u.first_name} {u.last_name}</p>
                                                                             <p className="text-xs text-on-surface-variant truncate">{getPrimaryRole(u.role_names)} • {u.email}</p>
                                                                         </div>
                                                                         <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0", isSelected ? "bg-primary border-primary text-on-primary" : "border-outline-variant/50")}>
                                                                             {isSelected && <Check className="w-3 h-3" />}
                                                                         </div>
                                                                     </div>
                                                                 );
                                                             })}
                                                     </div>
                                                 </div>
                                             )}
                                         </div>
                                     </div>

                                     <div className="flex gap-2 justify-end mt-4">
                                         <button onClick={() => { setEditingAnnId(null); setSelectedPostingRole(""); }} className="px-4 py-2 rounded-full font-label text-sm hover:bg-surface-variant">Cancel</button>
                                         <button onClick={() => { handleEditAnnouncementSub(ann.announcement_id, authorRole, isSystem, attachments); setSelectedPostingRole(""); }} className="bg-primary text-on-primary px-5 py-2 rounded-full font-label font-bold text-sm">Save</button>
                                     </div>
                                 </div>
                             ) : (
                                 <>
                                     
                                     <div className="ql-snow">
                                         <div className="tiptap-editor font-body text-lg text-on-surface-variant mb-2 leading-relaxed prose prose-sm sm:prose-base max-w-none [&_p]:mb-2 [&_a]:text-primary [&_a]:underline [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-2xl [&_iframe]:my-4 [&_img]:rounded-2xl [&_img]:my-4 [&_img]:max-h-[600px] [&_img]:w-auto px-0 py-0 break-normal" dangerouslySetInnerHTML={{ __html: displayContent }} />
                                     </div>
                                     {attachments.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {attachments.map((att: any, i: number) => (
                                                <a key={i} href={att.url} download={att.name} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-surface-variant/30 px-3 py-2 rounded-lg border border-outline-variant/30 text-sm font-label hover:bg-surface-variant transition-colors text-primary">
                                                    <span className="truncate max-w-[200px]">{att.name}</span>
                                                </a>
                                            ))}
                                        </div>
                                     )}
                                 </>
                             )}
                               </div>
                             )}
                         </div>

                         {/* Replies Section */}
                         {isExpanded && (
                         <div className="bg-surface-container-low border-t border-outline-variant/20 px-6 py-4 flex flex-col gap-4">
                               {replies.length > 0 && (
                                   <div className="flex flex-col gap-4">
                                       <p className="font-bold text-xs uppercase tracking-wider text-on-surface-variant">{replies.length} class comment{replies.length !== 1 ? 's' : ''}</p>
                                       <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2">
                                           {replies.map((r: any) => (
                                               <div key={r.reply_id} className="flex gap-3 text-sm group">
                                                   <div className="w-10 h-10 rounded-full bg-surface-variant text-on-surface flex items-center justify-center shrink-0 mt-1 cursor-pointer">
                                                       {getRoleIcon(getPrimaryRole(r.users), "w-6 h-6")}
                                                   </div>
                                                   <div className="flex-1 mt-1">
                                                       <div className="flex justify-between items-start">
                                                           <div>
                                                               <p className="font-bold text-lg text-on-surface mb-0.5 flex items-center gap-2">
                                                                   {(() => {
                                                                      const isReplyTeacher = r.users?.user_roles?.some((ur: any) => ur.roles?.role_name === 'Teacher');
                                                                      return r.users ? (isReplyTeacher ? formatTeacherName(r.users.first_name, r.users.last_name) : `${r.users.first_name} ${r.users.last_name}`) : "Unknown";
                                                                   })()}
                                                                   <span className="font-normal text-xs text-on-surface-variant group-hover:text-on-surface-variant/70 transition-colors">
                                                                       {new Date(r.created_at).toLocaleDateString('en-US', { timeZone: 'America/New_York' })}
                                                                   </span>
                                                               </p>
                                                           </div>
                                                           {(user?.role === 'builder' || r.user_id === getRealUserId(user?.id)) && (
                                                               <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                   <button 
                                                                       onClick={() => {
                                                                           setEditingReplyId(r.reply_id);
                                                                           setEditReplyContentStr(r.content);
                                                                       }}
                                                                       className="px-2 py-1 text-on-surface-variant hover:text-primary rounded-full transition-colors flex items-center gap-1"
                                                                   >
                                                                       <Edit2 className="w-3.5 h-3.5" />
                                                                       <span className="text-[10px] font-bold">Edit</span>
                                                                   </button>
                                                                   {confirmCommentDeleteId === r.reply_id ? (
                                                                       <div className="flex items-center gap-1">
                                                                           <button onClick={() => setConfirmCommentDeleteId(null)} className="text-[10px] font-bold text-on-surface-variant hover:text-on-surface px-1">Cancel</button>
                                                                           <button onClick={() => handleDeleteReply(r.reply_id, true)} className="text-[10px] font-bold text-error bg-error/10 hover:bg-error/20 px-2 py-1 rounded-full">Delete</button>
                                                                       </div>
                                                                   ) : (
                                                                       <button 
                                                                           onClick={() => setConfirmCommentDeleteId(r.reply_id)}
                                                                           className="px-2 py-1 text-on-surface-variant hover:text-error rounded-full transition-colors flex items-center gap-1"
                                                                       >
                                                                           <Trash2 className="w-3.5 h-3.5" />
                                                                           <span className="text-[10px] font-bold">Delete</span>
                                                                       </button>
                                                                   )}
                                                               </div>
                                                           )}
                                                       </div>
                                                       {editingReplyId === r.reply_id ? (
                                                            <div className="flex flex-col gap-2 mt-1">
                                                                                                                                <textarea 
                                                                    className="w-full px-3 py-2 bg-surface rounded-xl border border-outline-variant/50 focus:border-primary font-body text-sm min-h-[80px] outline-none"
                                                                    value={editReplyContentStr} onChange={(e) => setEditReplyContentStr(e.target.value)}
                                                                 />
                                                                 <div className="flex gap-2 justify-end">
                                                                     <button onClick={() => setEditingReplyId(null)} className="px-3 py-1.5 rounded-full font-label text-[10px] uppercase tracking-wider font-bold hover:bg-surface-variant">Cancel</button>
                                                                     <button onClick={() => handleEditReplySub(r.reply_id)} className="bg-primary text-on-primary px-4 py-1.5 rounded-full font-label text-[10px] uppercase tracking-wider font-bold">Save</button>
                                                                 </div>
                                                             </div>
                                                        ) : (
                                                            <p className="text-on-surface-variant leading-snug">{r.content}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {user?.id && user?.role !== 'volunteer' && (
                                    <div className="flex gap-3 items-center mt-1">
                                         <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                                            {getRoleIcon(user?.role || "student", "w-5 h-5")}
                                        </div>
                                        <div className="flex-1 relative">
                                            <input 
                                                type="text" 
                                                className="w-full pl-5 pr-12 py-3 bg-surface rounded-full border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body text-sm transition-all shadow-sm"
                                                placeholder="Add class comment..."
                                                value={replyBody[ann.announcement_id] || ""}
                                                onChange={(e) => setReplyBody(p => ({...p, [ann.announcement_id]: e.target.value}))}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleReplySubmit(ann.announcement_id);
                                                }}
                                            />
                                            <button 
                                                onClick={() => handleReplySubmit(ann.announcement_id)}
                                                disabled={isReplying[ann.announcement_id] || !replyBody[ann.announcement_id]?.trim()}
                                                className="absolute right-1.5 top-1.5 p-2 rounded-full text-primary hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                                            >
                                                {isReplying[ann.announcement_id] ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                )}
                          </div>
                         )}
                      </div>
                  )
              })}

              {filteredAnnouncements.length === 0 && (
                 <div className="flex flex-col items-center justify-center p-12 bg-surface-container-low border border-dashed border-outline-variant/40 rounded-3xl mt-4">
                    <Megaphone className="w-12 h-12 text-on-surface-variant opacity-50 mb-4" />
                    <p className="font-body text-lg text-on-surface font-medium">No announcements found</p>
                 </div>
              )}
           </div>
       )}

       {/* Compose Dialog */}
       {showCompose && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
               <div className="bg-surface-container-lowest w-full max-w-7xl rounded-3xl shadow-2xl  flex flex-col max-h-[90vh]">
                   <div className="px-6 py-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface shrink-0">
                       <h2 className="font-title text-xl font-bold text-on-surface flex items-center gap-2"><Plus className="w-5 h-5 text-primary"/> {t("Compose Announcement")}</h2>
                       <button onClick={() => setShowCompose(false)} className="p-2 text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors"><X className="w-5 h-5" /></button>
                   </div>
                   <form onSubmit={handleCreateAnnouncement} className="p-6 flex flex-col gap-6 overflow-y-auto flex-1">
                       {(user?.role === 'builder' || user?.role === 'admin' || user?.availableRoles?.includes('builder')) && (
                           <div className="flex items-center gap-2 mb-4">
                               <input
                                   type="checkbox"
                                   id="isSystemAnnouncement"
                                   checked={isSystemAnnouncement}
                                   onChange={e => setIsSystemAnnouncement(e.target.checked)}
                                   className="rounded border-outline-variant/50 text-primary focus:ring-primary w-4 h-4"
                               />
                               <label htmlFor="isSystemAnnouncement" className="font-label text-sm font-bold text-on-surface cursor-pointer">
                                   Post as System Announcement (No Name)
                               </label>
                           </div>
                       )}
                       {(user?.availableRoles?.length > 1) && !isSystemAnnouncement && (
                           <div>
                               <label className="block font-label text-sm uppercase tracking-wider font-bold text-on-surface-variant mb-3 flex items-center justify-between">
                                 <span>Post As Role</span>
                                 <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full normal-case">Multiple Roles Detected</span>
                               </label>
                               <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                                   {user.availableRoles.map((r: string) => (
                                       <button
                                           key={r}
                                           type="button"
                                           onClick={() => setSelectedPostingRole(r)}
                                           className={cn(
                                               "flex items-center gap-2 px-4 py-2 rounded-xl transition-all border shrink-0",
                                               selectedPostingRole === r 
                                                 ? "bg-primary text-on-primary border-primary shadow-sm" 
                                                 : "bg-surface text-on-surface hover:bg-surface-variant border-outline-variant/30"
                                           )}
                                       >
                                           <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0", selectedPostingRole === r ? "bg-white/20" : "bg-primary/10 text-primary")}>
                                              {getRoleIcon(r, "w-4 h-4")}
                                           </div>
                                           <span className="font-label font-bold text-sm capitalize">{r}</span>
                                       </button>
                                   ))}
                               </div>
                           </div>
                       )}
                       <div>
                           <label className="block font-label text-sm uppercase tracking-wider font-bold text-on-surface-variant mb-3">Send to Audience</label>
                           <div className="flex flex-wrap gap-2 mb-4">
                              {['all', 'roles', 'classes', 'users'].map(mode => (
                                  <button
                                      key={mode}
                                      type="button"
                                      onClick={() => setAudienceMode(mode)}
                                      className={cn(
                                          "px-4 py-2 rounded-full font-label text-xs font-bold capitalize transition-colors border",
                                          audienceMode === mode 
                                            ? "bg-primary text-on-primary border-primary" 
                                            : "bg-surface border-outline-variant/50 text-on-surface-variant hover:bg-surface-variant"
                                      )}
                                  >
                                      {mode === 'all' ? t('Everyone') : t('Specific ' + mode)}
                                  </button>
                              ))}
                           </div>

                           <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 text-sm max-h-48 overflow-y-auto">
                               {audienceMode === 'all' && (
                                   <p className="text-on-surface-variant">This announcement will be visible to everyone.</p>
                               )}
                               
                               {audienceMode === 'roles' && (
                                   <div className="grid grid-cols-2 gap-3">
                                       {roles.map(r => (
                                           <label key={r.role_id} className="flex items-center gap-2 cursor-pointer text-on-surface">
                                               <input 
                                                  type="checkbox" 
                                                  className="rounded border-outline-variant/50 text-primary focus:ring-primary"
                                                  checked={targetRoleIds.includes(r.role_id)}
                                                  onChange={() => toggleMultiSelect(setTargetRoleIds, r.role_id)}
                                               />
                                               {r.role_name}
                                           </label>
                                       ))}
                                   </div>
                               )}

                               {audienceMode === 'classes' && (
                                   <div className="grid grid-cols-2 gap-3">
                                       {classes.length === 0 ? <p className="text-on-surface-variant">No classes available.</p> : classes.map(c => (
                                           <label key={c.class_id} className="flex items-center gap-2 cursor-pointer text-on-surface">
                                               <input 
                                                  type="checkbox" 
                                                  className="rounded border-outline-variant/50 text-primary focus:ring-primary"
                                                  checked={targetClassIds.includes(c.class_id)}
                                                  onChange={() => toggleMultiSelect(setTargetClassIds, c.class_id)}
                                               />
                                               {c.class_name}
                                           </label>
                                       ))}
                                   </div>
                               )}

                               {audienceMode === 'users' && (
                                   <div className="flex flex-col">
                                       {(() => {
                                         const desiredOrder = ['Admin', 'Teacher', 'Staff', 'Volunteer', 'Parent', 'Student'];

                                         const getPrimaryRole = (roles: string[]) => {
                                             if (!roles || roles.length === 0) return 'Others';
                                             let bestIdx = 999;
                                             let bestRole = 'Others';
                                             for (const r of roles) {
                                                 const idx = desiredOrder.indexOf(r);
                                                 if (idx !== -1 && idx < bestIdx) {
                                                     bestIdx = idx;
                                                     bestRole = r;
                                                 }
                                             }
                                             if (bestIdx === 999) return roles[0];
                                             return bestRole;
                                         };

                                         const groupedUsers: Record<string, typeof availableUsers> = {};
                                         availableUsers.forEach(u => {
                                             let primary = getPrimaryRole(u.role_names || []);
                                             if (primary === 'Builder') primary = 'Teacher';
                                             if (!groupedUsers[primary]) groupedUsers[primary] = [];
                                             groupedUsers[primary].push(u);
                                         });

                                         const sortedRoles = Object.keys(groupedUsers).sort((a, b) => {
                                             const idxA = desiredOrder.indexOf(a);
                                             const idxB = desiredOrder.indexOf(b);
                                             if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                                             if (idxA !== -1) return -1;
                                             if (idxB !== -1) return 1;
                                             return a.localeCompare(b);
                                         });
                                         
                                         return sortedRoles.map(r => {
                                             const group = groupedUsers[r];
                                             if (!group || group.length === 0) return null;
                                             
                                             const getDisplay = (u: any) => {
                                                const isTeacher = u.role_names?.includes('Teacher') || u.role_names?.includes('Builder');
                                                return isTeacher ? formatTeacherName(u.first_name, u.last_name) : `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Unknown';
                                             };
                                             
                                             group.sort((a, b) => {
                                                const nameA = getDisplay(a);
                                                const nameB = getDisplay(b);
                                                
                                                const isMrA = nameA.startsWith('Mr.');
                                                const isMrB = nameB.startsWith('Mr.');
                                                const isMsA = nameA.startsWith('Ms.') || nameA.startsWith('Mrs.');
                                                const isMsB = nameB.startsWith('Ms.') || nameB.startsWith('Mrs.');
                                                
                                                if (isMrA && !isMrB) return -1;
                                                if (!isMrA && isMrB) return 1;
                                                
                                                if (!isMrA && !isMrB) {
                                                   if (isMsA && !isMsB) return -1;
                                                   if (!isMsA && isMsB) return 1;
                                                }
                                                
                                                return nameA.localeCompare(nameB);
                                             });

                                             const roleLabel = (r === "Others" ? "Unassigned" : (r === "Admin" ? "School Admins" : (r === "Teacher" ? "Teachers" : (r === "Student" ? "Students" : (r === "Parent" ? "Parents" : (r === "Staff" ? "Staff" : r + "s")))))) + ` (${group.length})`;

                                             return (
                                                <div key={r} className="mb-4 last:mb-0">
                                                    <div className="font-label text-xs uppercase tracking-wider text-on-surface-variant font-bold mb-2 bg-surface-variant/30 px-2 py-1 rounded">
                                                        {roleLabel}
                                                    </div>
                                                    <div className="flex flex-col gap-2 pl-2">
                                                        {group.map(u => {
                                                             const isTeacher = u.role_names?.includes('Teacher') || u.role_names?.includes('Builder');
                                                             const displayName = isTeacher ? formatTeacherName(u.first_name, u.last_name) : `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Unknown';
                                                             return (
                                                                 <label key={u.user_id} className="flex items-center gap-2 cursor-pointer text-on-surface border-b border-outline-variant/10 pb-2 last:border-0 last:pb-0">
                                                                    <input 
                                                                       type="checkbox" 
                                                                       className="rounded border-outline-variant/50 text-primary focus:ring-primary"
                                                                       checked={targetUserIds.includes(u.user_id)}
                                                                       onChange={() => toggleMultiSelect(setTargetUserIds, u.user_id)}
                                                                    />
                                                                    <span className="font-bold">{displayName}</span> 
                                                                </label>
                                                             );
                                                        })}
                                                    </div>
                                                </div>
                                             );
                                         });
                                       })()}
                                   </div>
                               )}
                           </div>
                       </div>
                       
                       <div>
                           <label className="block font-label text-sm uppercase tracking-wider font-bold text-on-surface-variant mb-2">Announcement Title</label>
                           <input 
                               type="text" 
                               required
                               value={composeTitle} 
                               onChange={(e) => setComposeTitle(e.target.value)}
                               className="w-full px-4 py-3 bg-surface border border-outline-variant/50 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body text-base"
                               placeholder="e.g., Important Schedule Update"
                           />
                       </div>
                       <div className="flex-1 flex flex-col">
                           <label className="block font-label text-sm uppercase tracking-wider font-bold text-on-surface-variant mb-2">Message</label>
                           <div className="bg-surface rounded-xl border border-outline-variant/50 ">
                               <RichTextEditor value={composeContent} onChange={setComposeContent} className="h-[500px]" />
                           </div>
                           
                           <div className="mt-4">
                               <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-surface-variant/30 hover:bg-surface-variant/50 border border-outline-variant/30 rounded-full text-sm font-label font-bold text-on-surface-variant transition-colors">
                                   <Paperclip className="w-4 h-4" />
                                   Attach File (Max 2MB)
                                   <input type="file" className="hidden" onChange={handleFileUpload} />
                               </label>
                               
                               {composeAttachments.length > 0 && (
                                   <div className="flex flex-wrap gap-2 mt-3">
                                       {composeAttachments.map((att, i) => (
                                           <div key={i} className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-lg border border-outline-variant/30 text-xs font-label">
                                               <span className="truncate max-w-[150px]">{att.name}</span>
                                               <button type="button" onClick={() => setComposeAttachments(prev => prev.filter((_, idx) => idx !== i))} className="text-error hover:text-error/80">
                                                   <X className="w-3 h-3" />
                                               </button>
                                           </div>
                                       ))}
                                   </div>
                               )}
                           </div>
                       </div>
                       <div className="flex justify-end pt-4 border-t border-outline-variant/20 shrink-0">
                           <button 
                               type="submit" 
                               disabled={isSubmitting || (audienceMode === 'roles' && targetRoleIds.length === 0) || (audienceMode === 'classes' && targetClassIds.length === 0) || (audienceMode === 'users' && targetUserIds.length === 0)}
                               className="px-8 py-3 bg-primary text-on-primary rounded-full font-label font-bold hover:bg-primary/90 transition-all shadow-md disabled:opacity-50 flex items-center gap-2">
                               {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Megaphone className="w-5 h-5"/>}
                               Publish Announcement
                           </button>
                       </div>
                   </form>
               </div>
          </div>
       )}

    </div>
  );
}
