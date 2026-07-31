import { useState, useEffect } from "react";
import { Search, Filter, Clock, Users, CheckCircle2, XCircle, Newspaper, Eye, X, FileText, Trash2, Sparkles, Upload, Download, Megaphone } from "lucide-react";
import { cn } from "../lib/utils";
import { supabase } from "../lib/supabase";


const getRealUserId = (id: string | null | undefined) => {
    if (!id) return null;
    if (id === 'demo' || id === 'builder_secret') return 'c4d458f8-ba08-4fc1-bbbf-c4c1eac64068';
    return id;
};

export default function PrincipalNewsletters() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Pending Approval");
  const [newsletters, setNewsletters] = useState<any[]>([]);
  const [readState, setReadState] = useState<Record<string, boolean>>({});
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [readCounts, setReadCounts] = useState<Record<string, number>>({});
  const [showPdfModal, setShowPdfModal] = useState<any>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [postModal, setPostModal] = useState<any>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [availableRoles, setAvailableRoles] = useState<{role_id: number, role_name: string}[]>([]);
  const [availableClasses, setAvailableClasses] = useState<{class_id: string, class_name: string}[]>([]);

  useEffect(() => {
    if (showPdfModal?.pdfData && showPdfModal.pdfData.includes('base64,')) {
      try {
        const base64 = showPdfModal.pdfData.split(',')[1];
        const byteString = atob(base64);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfBlobUrl(url);
        return () => URL.revokeObjectURL(url);
      } catch(e) {
        setPdfBlobUrl(showPdfModal.pdfData);
      }
    } else {
      setPdfBlobUrl(showPdfModal?.pdfData || null);
    }
  }, [showPdfModal?.pdfData]);

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
        try {
            let cid = JSON.parse(userJson).id;
            if (cid === 'demo') cid = 'c4d458f8-ba08-4fc1-bbbf-c4c1eac64068';
            setCurrentUserId(cid);
        } catch(e) {}
    }
    loadNewsletters();
    const fetchClassesAndRoles = async () => {
      try {
        const { data: cData } = await supabase.from('classes').select('class_id, class_name');
        if (cData) setAvailableClasses(cData);
        const { data: rData } = await supabase.from('roles').select('role_id, role_name');
        if (rData) setAvailableRoles(rData.filter(r => [4, 5, 9].includes(r.role_id))); // Teacher, Student, Parent
      } catch(e){}
    };
    fetchClassesAndRoles();
  }, []);

  const markAsRead = async (id: string | number) => {
        if (readState[id]) return;
        if (!currentUserId) return;
        
        setReadState(prev => ({ ...prev, [id]: true }));
        await supabase.from('read_receipts').upsert({
            user_id: getRealUserId(currentUserId),
            item_type: 'newsletter',
            item_id: id,
            read_at: new Date().toISOString()
        }, { onConflict: 'user_id, item_type, item_id' });
        window.dispatchEvent(new Event('news_read_updated'));
    };

    const loadNewsletters = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('newsletters').select('newsletter_id, title, content, created_at, is_published, author_id, class_id').order('newsletter_id', { ascending: false });
      
      if (error) {
        if (error.code === '42501') {
           console.warn("RLS prevents reading newsletters. Please check table policies.");
        }
        throw error;
      }
      
      if (data) {
        const userJson = localStorage.getItem('user');
        let currentUserId = null;
        if (userJson) {
           try {
               currentUserId = JSON.parse(userJson).id;
               if (currentUserId === 'demo') {
                   currentUserId = 'c4d458f8-ba08-4fc1-bbbf-c4c1eac64068'; // fallback
               }
           } catch(e) {}
        }
        
        const uId = currentUserId;
        if (uId) {
             const { data: receipts } = await supabase.from('read_receipts').select('item_id').eq('user_id', getRealUserId(uId)).eq('item_type', 'newsletter');
             const rState = {};
             receipts?.forEach(r => rState[r.item_id] = true);
             setReadState(rState);
        }
    

        const parsed = data.map((item: any) => {
           const formattedDate = item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { timeZone: 'America/New_York', month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown Date';
           try {
             return { id: item.newsletter_id, title: item.title, author: item.author_id, class_id: item.class_id, ...JSON.parse(item.content || "{}"), date: formattedDate };
           } catch {
             return { id: item.newsletter_id, title: item.title, content: item.content, class_id: item.class_id, status: "Approved", date: formattedDate };
           }
        });
        setNewsletters(parsed);

                 supabase.from('read_receipts')
                   .select('item_id')
                   .eq('item_type', 'newsletter')
                   .in('item_id', data.map((n: any) => n.newsletter_id.toString()))
                   .then(({ data: rc }) => {
                       if (rc) {
                           const counts: Record<string, number> = {};
                           rc.forEach(r => {
                               counts[r.item_id] = (counts[r.item_id] || 0) + 1;
                           });
                           setReadCounts(counts);
                       }
                   });

      }
    } catch (e: any) {
      console.error(e);
      setNewsletters([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateComment = async (id: string | number, comment: string) => {
     const newsletter = newsletters.find(n => n.id === id);
     if (!newsletter) return;
     
     // Optimistically update local state
     setNewsletters(prev => prev.map(n => n.id === id ? { ...n, adminComment: comment } : n));

     const updatedProps = { ...newsletter, adminComment: comment };
     delete updatedProps.id;
     delete updatedProps.title;

     try {
         // @ts-ignore
         const { error } = await supabase.from('newsletters').update({
             content: JSON.stringify(updatedProps),
             status: updatedProps.status
         }).eq('newsletter_id', id);
         
         if (error) {
             if (error.code === '42501') console.warn("RLS blocks update.");
             throw error;
         }
     } catch(e) {
         console.error("Comment save failed", e);
     }
  };

  const STATUSES = ["All", "Pending Approval", "Rejected", "Approved", "Published"];

  const filteredNewsletters = newsletters.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || (n.author && n.author.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = activeFilter === "All" || n.status === activeFilter;
    return matchesSearch && matchesFilter && n.status !== 'Draft'; // Admins don't see drafts
  });

  const groupedNewsletters: Record<string, any[]> = {};
  filteredNewsletters.forEach(news => {
     const c = availableClasses.find(c => c.class_id === news.class_id);
     const cName = c ? c.class_name : "General / Unassigned";
     if (!groupedNewsletters[cName]) {
         groupedNewsletters[cName] = [];
     }
     groupedNewsletters[cName].push(news);
  });

  const handleRevert = async (id: string | number) => {
     const newsletter = newsletters.find(n => n.id === id);
     if (!newsletter) return;
     
     const updatedProps = { ...newsletter, status: "Pending Approval" };
     delete updatedProps.id;
     delete updatedProps.title;
     
     try {
         // @ts-ignore
         const { error } = await supabase.from('newsletters').update({
             content: JSON.stringify(updatedProps),
             status: updatedProps.status
         }).eq('newsletter_id', id);
         
         if (error) {
             if (error.code === '42501') alert("RLS blocks update. Please check table policies.");
             throw error;
         }
         await loadNewsletters();
     } catch (err) {
         console.error("Revert failed", err);
         alert("Failed to revert status.");
     }
  };

  const handleApprove = async (id: string | number) => {
     const newsletter = newsletters.find(n => n.id === id);
     if (!newsletter) return;
     
     const updatedProps = { ...newsletter, status: "Approved" };
     delete updatedProps.id;
     delete updatedProps.title;

     try {
         // @ts-ignore
         const { error } = await supabase.from('newsletters').update({
             content: JSON.stringify(updatedProps),
             status: updatedProps.status
         }).eq('newsletter_id', id);
         
         if (error) {
             if (error.code === '42501') alert("RLS blocks update. Please check table policies.");
             throw error;
         }
         await loadNewsletters();
     } catch(e) {
         console.error("Approve failed", e);
         alert("Failed to approve newsletter");
     }
  };

  const handleReject = async (id: string | number) => {
     const newsletter = newsletters.find(n => n.id === id);
     if (!newsletter) return;
     if (!newsletter.adminComment?.trim()) return alert("Please provide a reason in the Admin Notes box below before rejecting.");

     const updatedProps = { ...newsletter, status: "Rejected" };
     delete updatedProps.id;
     delete updatedProps.title;

     try {
         // @ts-ignore
         const { error } = await supabase.from('newsletters').update({
             content: JSON.stringify(updatedProps),
             status: updatedProps.status
         }).eq('newsletter_id', id);
         
         if (error) {
             if (error.code === '42501') alert("RLS blocks update. Please check table policies.");
             throw error;
         }
         
         await loadNewsletters();
     } catch(e) {
         console.error("Reject failed", e);
         alert("Failed to reject newsletter");
     }
  };

  const handleDelete = async (id: string | number, confirmed: boolean = false) => {
     if (!confirmed) return;
     if (!id) return;
     
     try {
         // @ts-ignore
         const { error } = await supabase.from('newsletters').delete().eq('newsletter_id', id);
         
         if (error) {
             throw error;
         }
         setConfirmDeleteId(null);
         await loadNewsletters();
     } catch(e) {
         console.error("Delete failed", e);
     }
  };

  const handleDownload = () => {
      if (!pdfBlobUrl) return;
      const a = document.createElement("a");
      a.href = pdfBlobUrl;
      a.download = showPdfModal.pdfName || "newsletter.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };

  const handleUploadEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
          alert("File is too large. Max 5MB allowed.");
          return;
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
          const base64 = event.target?.result as string;
          
          const newsletter = newsletters.find(n => n.id === showPdfModal.id);
          if (!newsletter) return;

          const updatedProps = { ...newsletter, pdfData: base64, pdfName: file.name };
          delete updatedProps.id;
          delete updatedProps.title;
          delete updatedProps.class_id;

          try {
              // @ts-ignore
              const { error } = await supabase.from('newsletters').update({
             content: JSON.stringify(updatedProps),
             status: updatedProps.status
         }).eq('newsletter_id', showPdfModal.id);
              
              if (error) throw error;

              setShowPdfModal((prev: any) => prev ? { ...prev, pdfData: base64, pdfName: file.name } : null);
              await loadNewsletters();
              alert("Edited newsletter uploaded successfully.");
          } catch(err) {
              console.error("Upload failed", err);
              alert("Failed to upload edited newsletter.");
          }
      };
      reader.readAsDataURL(file);
      e.target.value = '';
  };

  const handlePostAnnouncement = async () => {
      if (!postModal) return;
      
      let atts: any[] = [];
      if (postModal.attachments && Array.isArray(postModal.attachments)) {
          atts = [...postModal.attachments];
      }
      if (postModal.pdfData) {
          atts.push({ name: postModal.pdfName || "newsletter.pdf", url: postModal.pdfData });
      }
      let encodedContent = `Newsletter: ${postModal.title}\n\n${postModal.content || ''}`;
      if (atts.length > 0) {
          encodedContent += `\n\n---ATTACHMENTS---\n${JSON.stringify(atts)}`;
      }
      const payload: any = {
          title: `Newsletter: ${postModal.title}`,
          content: encodedContent,
          target_class_ids: selectedClasses,
          target_role_ids: selectedRoles,
          target_user_ids: [],
          created_by: 'ec13df7f-1a4f-422e-abd8-05732ca798d2',
          expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString()
      };
      
      const userJson = localStorage.getItem('user');
      if (userJson) {
         try {
             payload.created_by = JSON.parse(userJson).id;
             if (payload.created_by === 'demo') {
                 payload.created_by = 'c4d458f8-ba08-4fc1-bbbf-c4c1eac64068';
             }
         } catch(e){}
      }

      try {
          const { error } = await supabase.from('announcements').insert(payload);
          if (error) throw error;
          const selectedClassNames = availableClasses.filter(c => selectedClasses.includes(c.class_id)).map(c => c.class_name);
          const selectedRoleNames = availableRoles.filter(r => selectedRoles.includes(r.role_id)).map(r => r.role_name + 's');
          const allTargets = [...selectedRoleNames, ...selectedClassNames].join(', ');
          
          const newsletter = newsletters.find(n => n.id === postModal.id);
          if (newsletter) {
             const updatedProps = { ...newsletter, status: 'Published', posted_to: allTargets };
             delete updatedProps.id;
             delete updatedProps.title;
             delete updatedProps.class_id;
             await supabase.from('newsletters').update({ content: JSON.stringify(updatedProps), is_published: true, status: updatedProps.status }).eq('newsletter_id', postModal.id);
          }

          alert(`Posted to announcement board successfully to: ${allTargets}`);
          setPostModal(null);
          await loadNewsletters();
      } catch (err) {
          console.error("Post failed", err);
          alert("Failed to post announcement.");
      }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto p-6 md:p-8 flex flex-col gap-8 pb-32 md:pb-8">
       {/* Header */}
       <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div>
           <h1 className="font-display text-4xl text-primary font-bold tracking-tight">Review Newsletters</h1>
           <p className="font-body text-lg text-on-surface-variant mt-2">Approve or reject newsletters submitted by teachers.</p>
         </div>
       </header>

       {/* Toolbar */}
       <div className="flex flex-col xl:flex-row justify-between gap-6">
          {/* Filters */}
          <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar w-full xl:w-auto">
             {STATUSES.map(status => (
                <button
                  key={status}
                  onClick={() => setActiveFilter(status)}
                  className={cn(
                    "whitespace-nowrap px-6 py-2.5 rounded-full font-label text-sm transition-all border font-bold shrink-0",
                    activeFilter === status 
                      ? "bg-primary-container text-on-primary-container border-primary-container shadow-sm" 
                      : "bg-surface text-on-surface-variant border-outline-variant/40 hover:bg-surface-variant/50"
                  )}
                >
                   {status}
                </button>
             ))}
          </div>

          {/* Search */}
          <div className="flex items-center gap-3 bg-surface-container-low rounded-full px-4 py-2 border border-outline-variant/40 shrink-0 w-full xl:w-80 shadow-sm focus-within:border-primary/50 transition-colors">
             <Search className="w-5 h-5 text-on-surface-variant" />
             <input 
               type="text" 
               placeholder="Search by title or author..." 
               className="bg-transparent border-none outline-none font-body text-sm w-full"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
             <button className="p-1.5 text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors">
               <Filter className="w-4 h-4" />
             </button>
          </div>
       </div>

       {/* List / Grid */}
       <div className="flex flex-col gap-8">
          {Object.keys(groupedNewsletters).sort().map(groupName => (
             <div key={groupName} className="flex flex-col gap-4">
                <h2 className="font-display text-2xl font-bold text-primary border-b border-outline-variant/30 pb-2">{groupName}</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {groupedNewsletters[groupName].map(news => (
                     <div key={news.id} onMouseEnter={() => markAsRead(news.id)}
                        onTouchStart={() => markAsRead(news.id)}
                        onClick={() => markAsRead(news.id)}
                        className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-6 flex flex-col hover:shadow-md transition-all shadow-sm">
                         <div className="flex justify-between items-start mb-4">
                            <span className={cn(
                               "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-label flex items-center gap-1.5",
                               news.status === "Approved" ? "bg-primary-container/20 text-primary border border-primary/20" : 
                               news.status === "Published" ? "bg-secondary-container/20 text-secondary border border-secondary/20" : 
                               news.status === "Rejected" ? "bg-error-container/20 text-error border border-error/20" :
                               "bg-tertiary-container/30 text-tertiary-dim border border-tertiary/20"
                            )}>
                               {news.status === "Approved" ? <CheckCircle2 className="w-3 h-3" /> : news.status === "Published" ? <CheckCircle2 className="w-3 h-3" /> : news.status === "Rejected" ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                               {news.status}
                            </span>
                            <div className="flex gap-2">
                               <button onClick={() => setShowPdfModal(news)} className="w-8 h-8 rounded-full hover:bg-surface-variant flex items-center justify-center text-on-surface-variant transition-colors" title="View Full">
                                  <Eye className="w-4 h-4" />
                               </button>
                               {news.status === "Pending Approval" && (
                                   <button onClick={() => handleApprove(news.id)} className="w-8 h-8 rounded-full hover:bg-primary-container/50 hover:text-primary flex items-center justify-center text-on-surface-variant transition-colors" title="Approve">
                                      <CheckCircle2 className="w-4 h-4" />
                                   </button>
                               )}
                               {(news.status === "Pending Approval" || news.status === "Approved") && (
                                   <button onClick={() => handleReject(news.id)} className="w-8 h-8 rounded-full hover:bg-error-container/50 hover:text-error flex items-center justify-center text-on-surface-variant transition-colors" title="Reject">
                                      <XCircle className="w-4 h-4" />
                                   </button>
                               )}
                               {news.status === "Approved" && (
                                   <button onClick={() => handleRevert(news.id)} className="w-8 h-8 rounded-full hover:bg-surface-variant flex items-center justify-center text-on-surface-variant transition-colors" title="Revert to Pending">
                                      <Clock className="w-4 h-4" />
                                   </button>
                               )}
                               {confirmDeleteId === news.id ? (
                                   <div className="flex items-center gap-1 bg-error-container/20 px-2 rounded-full">
                                       <button onClick={() => setConfirmDeleteId(null)} className="text-[10px] font-bold text-on-surface-variant hover:text-on-surface px-1 py-1">Cancel</button>
                                       <button onClick={() => handleDelete(news.id, true)} className="text-[10px] font-bold text-error hover:underline px-1 py-1">Confirm</button>
                                   </div>
                               ) : (
                               <button onClick={() => setConfirmDeleteId(news.id)} className="w-8 h-8 rounded-full hover:bg-error-container/50 hover:text-error flex items-center justify-center text-on-surface-variant transition-colors" title="Delete">
                                  <Trash2 className="w-4 h-4" />
                               </button>
                               )}
                            </div>
                         </div>

                         <h3 className="font-display text-xl font-bold text-on-surface mb-1 flex items-center gap-2">
            {news.title}
            {news.author !== getRealUserId(currentUserId) && !readState[news.id] && <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-primary text-on-primary font-bold uppercase tracking-wider"><Sparkles className="w-3 h-3 animate-pulse"/> New</span>}
        </h3>
                         <p className="font-label text-xs text-on-surface-variant font-bold mb-4">Submitted by {news.author}</p>
                         <p className="font-body text-sm text-on-surface-variant mb-4 line-clamp-3 flex-1">{news.content}</p>

                         {news.pdfName && (
                             <a href={news.pdfData} target="_blank" rel="noreferrer" className="flex items-center gap-2 mb-2 bg-surface-container hover:bg-surface-variant transition-colors py-1.5 px-3 rounded-lg w-max max-w-full overflow-hidden">
                                 <FileText className="w-4 h-4 text-primary shrink-0" />
                                 <span className="text-xs font-mono truncate text-primary hover:underline">{news.pdfName}</span>
                             </a>
                         )}
                         {news.attachments && news.attachments.length > 0 && (
                             <div className="flex flex-wrap gap-2 mb-4">
                                 {news.attachments.map((att: any, i: number) => (
                                     <a key={i} href={att.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-surface-container hover:bg-surface-variant transition-colors py-1.5 px-3 rounded-lg max-w-full overflow-hidden">
                                         <FileText className="w-4 h-4 text-primary shrink-0" />
                                         <span className="text-xs font-mono truncate text-primary hover:underline">{att.name}</span>
                                     </a>
                                 ))}
                             </div>
                         )}

                         <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20 mt-auto">
                            <div className="flex items-center gap-2 text-on-surface-variant">
                               <Users className="w-4 h-4 shrink-0" />
                               <span className="font-label text-xs uppercase tracking-wider font-bold text-ellipsis overflow-hidden line-clamp-1">{news.posted_to || news.audience || groupName}</span>
                            </div>
                            <span className="font-caption text-xs text-on-surface-variant">{news.date}</span>
                         </div>
                     </div>
                  ))}
                </div>
             </div>
          ))}

          {filteredNewsletters.length === 0 && (
             <div className="col-span-full flex flex-col items-center justify-center p-12 bg-surface-container-low border border-dashed border-outline-variant/40 rounded-3xl">
                <Newspaper className="w-12 h-12 text-on-surface-variant opacity-50 mb-4" />
                <p className="font-body text-lg text-on-surface font-medium">No newsletters awaiting review</p>
             </div>
          )}
       </div>

       {/* PDF Viewer Modal */}
       {showPdfModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm animate-in fade-in duration-200">
             <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl w-full max-w-4xl h-[90vh] shadow-xl flex flex-col overflow-hidden mx-auto">
                <div className="flex items-center justify-between p-4 border-b border-outline-variant/20 bg-surface-container-low">
                   <h2 className="text-lg font-display font-bold text-on-surface">{showPdfModal.title}</h2>
                   <div className="flex gap-2">
                       {showPdfModal.status === "Pending Approval" && (
                         <>
                           <button onClick={async () => { await handleApprove(showPdfModal.id); setShowPdfModal(null); }} className="bg-primary/10 text-primary hover:bg-primary/20 font-bold py-1.5 px-4 rounded-full transition-colors text-sm flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4" /> Approve
                           </button>
                         </>
                       )}
                       {(showPdfModal.status === "Pending Approval" || showPdfModal.status === "Approved") && (
                           <button onClick={() => { handleReject(showPdfModal.id); setShowPdfModal(null); }} className="bg-error/10 text-error hover:bg-error/20 font-bold py-1.5 px-4 rounded-full transition-colors text-sm flex items-center gap-2">
                              <XCircle className="w-4 h-4" /> Reject
                           </button>
                       )}
                       {showPdfModal.status === "Approved" && (
                           <button onClick={() => { handleRevert(showPdfModal.id); setShowPdfModal(null); }} className="bg-surface-variant text-on-surface hover:bg-surface-variant/80 font-bold py-1.5 px-4 rounded-full transition-colors text-sm flex items-center gap-2">
                              <Clock className="w-4 h-4" /> Revert to Pending
                           </button>
                       )}
                       <button onClick={() => { handleDelete(showPdfModal.id, true); setShowPdfModal(null); }} className="bg-error/10 text-error hover:bg-error/20 font-bold py-1.5 px-4 rounded-full transition-colors text-sm flex items-center gap-2">
                          <Trash2 className="w-4 h-4" /> Delete
                       </button>
                       <button onClick={handleDownload} className="bg-surface-variant text-on-surface hover:bg-surface-variant/80 font-bold py-1.5 px-4 rounded-full transition-colors text-sm flex items-center gap-2">
                          <Download className="w-4 h-4" /> Download
                       </button>
                       <label className="bg-surface-variant text-on-surface hover:bg-surface-variant/80 font-bold py-1.5 px-4 rounded-full transition-colors text-sm flex items-center gap-2 cursor-pointer">
                          <Upload className="w-4 h-4" /> Upload Edited
                          <input type="file" className="hidden" accept="application/pdf" onChange={handleUploadEdit} />
                       </label>
                       {showPdfModal.status === "Approved" && (
                           <button onClick={() => {
                               setPostModal(showPdfModal);
                               setSelectedClasses(showPdfModal.class_id ? [showPdfModal.class_id] : []);
                           }} className="bg-tertiary/10 text-tertiary hover:bg-tertiary/20 font-bold py-1.5 px-4 rounded-full transition-colors text-sm flex items-center gap-2">
                              <Megaphone className="w-4 h-4" /> Post
                           </button>
                       )}
                       <button onClick={() => {
                          const w = window.open();
                          if(w) {
                              
                              w.document.write('<iframe src="' + pdfBlobUrl + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>');
                              setTimeout(() => { w.print(); }, 500);
                          }
                       }} className="bg-primary text-on-primary hover:bg-primary/90 font-bold py-1.5 px-4 rounded-full transition-colors text-sm flex items-center gap-2">
                          <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                          Print
                       </button>
                       <button onClick={() => setShowPdfModal(null)} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-surface-variant text-on-surface-variant ml-2">
                          <X className="w-5 h-5" />
                       </button>
                   </div>
                </div>
                <div className="flex-1 bg-surface-container-lowest p-2 flex flex-col gap-2 overflow-y-auto">
                    {pdfBlobUrl ? (
                        <iframe src={pdfBlobUrl} className="flex-1 w-full min-h-[400px] rounded-xl border border-outline-variant/20" title="PDF Viewer" />
                    ) : (
                        <div className="flex-1 p-6 bg-surface-container-low rounded-xl border border-outline-variant/20 overflow-y-auto whitespace-pre-wrap font-body text-on-surface">
                            {showPdfModal.content || "No content available."}
                        </div>
                    )}
                    {showPdfModal.attachments && showPdfModal.attachments.length > 0 && (
                        <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20 shrink-0">
                            <label className="block text-xs font-label font-bold text-on-surface-variant mb-2">Attached Files</label>
                            <div className="flex flex-wrap gap-2">
                                {showPdfModal.attachments.map((att: any, i: number) => (
                                    <a key={i} href={att.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-surface-container hover:bg-surface-variant transition-colors py-2 px-3 rounded-lg border border-outline-variant/30">
                                        <FileText className="w-4 h-4 text-primary shrink-0" />
                                        <span className="text-sm font-medium text-primary hover:underline">{att.name}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20 shrink-0">
                       <label className="block text-xs font-label font-bold text-on-surface-variant mb-1">Admin Notes / Description</label>
                       <textarea 
                          value={newsletters.find(n => n.id === showPdfModal.id)?.adminComment || ""}
                          onChange={(e) => {
                              const val = e.target.value;
                              setNewsletters(prev => prev.map(n => n.id === showPdfModal.id ? { ...n, adminComment: val } : n));
                              setShowPdfModal(prev => prev ? { ...prev, adminComment: val } : null);
                          }}
                          onBlur={(e) => handleUpdateComment(showPdfModal.id, e.target.value)}
                          placeholder="Add a comment, note, or rejection reason here..."
                          className="w-full bg-surface-container px-3 py-2 rounded-lg border border-outline-variant/30 focus:border-primary outline-none transition-colors text-sm text-on-surface resize-y"
                          rows={2}
                       />
                    </div>
                </div>
             </div>
          </div>
       )}
       
            {postModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
                   <div className="bg-surface-container-lowest rounded-3xl p-6 w-full max-w-md shadow-lg flex flex-col">
                       <h3 className="font-title text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
                           <Megaphone className="w-5 h-5 text-tertiary" /> Post Newsletter
                       </h3>
                       <p className="text-on-surface-variant mb-4 text-sm font-body">Select the audience to post this newsletter to.</p>
                       <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto mb-6 pr-2">
                           <div className="text-xs font-bold font-label uppercase text-on-surface-variant mt-2 mb-1">Target Roles</div>
                           {availableRoles.map(r => (
                               <label key={r.role_id} className="flex items-center gap-3 p-3 rounded-xl border border-outline-variant/30 hover:bg-surface-variant/30 cursor-pointer transition-colors">
                                   <input type="checkbox" className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary"
                                     checked={selectedRoles.includes(r.role_id)}
                                     onChange={(e) => {
                                         if (e.target.checked) {
                                             setSelectedRoles(prev => [...prev, r.role_id]);
                                         } else {
                                             setSelectedRoles(prev => prev.filter(id => id !== r.role_id));
                                         }
                                     }}
                                   />
                                   <span className="font-label text-sm text-on-surface font-bold">All {r.role_name}s</span>
                               </label>
                           ))}
                           <div className="text-xs font-bold font-label uppercase text-on-surface-variant mt-2 mb-1">Target Classes</div>
                           <label className="flex items-center gap-3 p-3 rounded-xl border border-outline-variant/30 hover:bg-surface-variant/30 cursor-pointer transition-colors">
                               <input type="checkbox" className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary"
                                 checked={selectedClasses.length === availableClasses.length && availableClasses.length > 0}
                                 onChange={(e) => {
                                     if (e.target.checked) {
                                         setSelectedClasses(availableClasses.map(c => c.class_id));
                                     } else {
                                         setSelectedClasses([]);
                                     }
                                 }}
                               />
                               <span className="font-label text-sm text-on-surface font-bold">Select All</span>
                           </label>
                           {availableClasses.map(c => (
                               <label key={c.class_id} className="flex items-center gap-3 p-3 rounded-xl border border-outline-variant/30 hover:bg-surface-variant/30 cursor-pointer transition-colors">
                                   <input type="checkbox" className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary"
                                     checked={selectedClasses.includes(c.class_id)}
                                     onChange={(e) => {
                                         if (e.target.checked) {
                                             setSelectedClasses(prev => [...prev, c.class_id]);
                                         } else {
                                             setSelectedClasses(prev => prev.filter(id => id !== c.class_id));
                                         }
                                     }}
                                   />
                                   <span className="font-label text-sm text-on-surface font-bold">{c.class_name}</span>
                               </label>
                           ))}
                       </div>
                       
                       <div className="flex gap-3 justify-end mt-auto">
                           <button onClick={() => setPostModal(null)} className="px-6 py-2 rounded-full font-label text-sm bg-surface-variant text-on-surface-variant font-bold hover:bg-surface-variant/80 transition-colors">
                               Cancel
                           </button>
                           <button onClick={handlePostAnnouncement} disabled={selectedClasses.length === 0 && selectedRoles.length === 0} className="px-6 py-2 rounded-full font-label text-sm bg-tertiary text-on-tertiary font-bold hover:bg-tertiary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                               Post to Announcements
                           </button>
                       </div>
                   </div>
                </div>
            )}
            
    </div>
  );
}
