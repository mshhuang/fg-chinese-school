import { useState, useEffect } from "react";
import { Search, Filter, Clock, Users, CheckCircle2, XCircle, Newspaper, Eye, X, FileText, Trash2 } from "lucide-react";
import { cn } from "../lib/utils";
import { supabase } from "../lib/supabase";

export default function PrincipalNewsletters() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Pending Approval");
  const [newsletters, setNewsletters] = useState<any[]>([]);
  const [showPdfModal, setShowPdfModal] = useState<any>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNewsletters();
  }, []);

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
        if (currentUserId) {
             const readStateStr = localStorage.getItem(`news_read_${currentUserId}`);
             const readState = readStateStr ? JSON.parse(readStateStr) : {};
             let updated = false;
             data.forEach(item => {
                 if (item.is_published === true && !readState[item.newsletter_id]) {
                     readState[item.newsletter_id] = true;
                     updated = true;
                 }
             });
             if (updated) {
                 localStorage.setItem(`news_read_${currentUserId}`, JSON.stringify(readState));
                 window.dispatchEvent(new Event('news_read_updated'));
             }
        }

        const parsed = data.map((item: any) => {
           try {
             return { id: item.newsletter_id, title: item.title, author: item.author_id, ...JSON.parse(item.content || "{}") };
           } catch {
             return { id: item.newsletter_id, title: item.title, content: item.content, status: "Published" };
           }
        });
        setNewsletters(parsed);
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
             content: JSON.stringify(updatedProps)
         }).eq('newsletter_id', id);
         
         if (error) {
             if (error.code === '42501') console.warn("RLS blocks update.");
             throw error;
         }
     } catch(e) {
         console.error("Comment save failed", e);
     }
  };

  const STATUSES = ["All", "Pending Approval", "Published", "Rejected"];

  const filteredNewsletters = newsletters.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || (n.author && n.author.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = activeFilter === "All" || n.status === activeFilter;
    return matchesSearch && matchesFilter && n.status !== 'Draft'; // Admins don't see drafts
  });

  const handleApprove = async (id: string | number) => {
     const newsletter = newsletters.find(n => n.id === id);
     if (!newsletter) return;
     
     const updatedProps = { ...newsletter, status: "Published" };
     delete updatedProps.id;
     delete updatedProps.title;

     try {
         // @ts-ignore
         const { error } = await supabase.from('newsletters').update({
             content: JSON.stringify(updatedProps)
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
             content: JSON.stringify(updatedProps)
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
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredNewsletters.map(news => (
             <div key={news.id} className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-6 flex flex-col hover:shadow-md transition-all shadow-sm">
                 <div className="flex justify-between items-start mb-4">
                    <span className={cn(
                       "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-label flex items-center gap-1.5",
                       news.status === "Published" ? "bg-primary-container/20 text-primary border border-primary/20" : 
                       news.status === "Rejected" ? "bg-error-container/20 text-error border border-error/20" :
                       "bg-tertiary-container/30 text-tertiary-dim border border-tertiary/20"
                    )}>
                       {news.status === "Published" ? <CheckCircle2 className="w-3 h-3" /> : news.status === "Rejected" ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                       {news.status}
                    </span>
                    <div className="flex gap-2">
                       {news.pdfData && (
                           <button onClick={() => setShowPdfModal(news)} className="w-8 h-8 rounded-full hover:bg-surface-variant flex items-center justify-center text-on-surface-variant transition-colors" title="View Full">
                              <Eye className="w-4 h-4" />
                           </button>
                       )}
                       {news.status === "Pending Approval" && (
                         <>
                           <button onClick={() => handleApprove(news.id)} className="w-8 h-8 rounded-full hover:bg-primary-container/50 hover:text-primary flex items-center justify-center text-on-surface-variant transition-colors" title="Approve">
                              <CheckCircle2 className="w-4 h-4" />
                           </button>
                           <button onClick={() => handleReject(news.id)} className="w-8 h-8 rounded-full hover:bg-error-container/50 hover:text-error flex items-center justify-center text-on-surface-variant transition-colors" title="Reject">
                              <XCircle className="w-4 h-4" />
                           </button>
                         </>
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

                 <h3 className="font-display text-xl font-bold text-on-surface mb-1">{news.title}</h3>
                 <p className="font-label text-xs text-on-surface-variant font-bold mb-4">Submitted by {news.author}</p>
                 <p className="font-body text-sm text-on-surface-variant mb-4 line-clamp-3 flex-1">{news.content}</p>

                 {news.pdfName && (
                     <div className="flex items-center gap-2 mb-4 bg-surface-container py-1.5 px-3 rounded-lg w-max max-w-full overflow-hidden">
                         <FileText className="w-4 h-4 text-primary shrink-0" />
                         <span className="text-xs font-mono truncate">{news.pdfName}</span>
                     </div>
                 )}

                 <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20 mt-auto">
                    <div className="flex items-center gap-2 text-on-surface-variant">
                       <Users className="w-4 h-4 shrink-0" />
                       <span className="font-label text-xs uppercase tracking-wider font-bold">{news.audience}</span>
                    </div>
                    <span className="font-caption text-xs text-on-surface-variant">{news.date}</span>
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
                           <button onClick={() => { handleApprove(showPdfModal.id); setShowPdfModal(null); }} className="bg-primary/10 text-primary hover:bg-primary/20 font-bold py-1.5 px-4 rounded-full transition-colors text-sm flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4" /> Approve
                           </button>
                           <button onClick={() => { handleReject(showPdfModal.id); setShowPdfModal(null); }} className="bg-error/10 text-error hover:bg-error/20 font-bold py-1.5 px-4 rounded-full transition-colors text-sm flex items-center gap-2">
                              <XCircle className="w-4 h-4" /> Reject
                           </button>
                         </>
                       )}
                       <button onClick={() => { handleDelete(showPdfModal.id); setShowPdfModal(null); }} className="bg-error/10 text-error hover:bg-error/20 font-bold py-1.5 px-4 rounded-full transition-colors text-sm flex items-center gap-2">
                          <Trash2 className="w-4 h-4" /> Delete
                       </button>
                       <button onClick={() => {
                          const w = window.open();
                          if(w) {
                              w.document.write('<iframe src="' + showPdfModal.pdfData + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>');
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
                <div className="flex-1 bg-surface-container-lowest p-2 flex flex-col gap-2">
                    <iframe src={showPdfModal.pdfData} className="flex-1 w-full rounded-xl border border-outline-variant/20" title="PDF Viewer" />
                    <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
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
    </div>
  );
}
