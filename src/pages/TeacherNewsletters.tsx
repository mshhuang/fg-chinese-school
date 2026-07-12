import React, { useState, useEffect, useRef } from "react";
import { Search, Plus, Clock, Edit3, Trash2, Send, CheckCircle2, FileText, X, Eye, AlertCircle, Newspaper, Filter, Users } from "lucide-react";
import { cn } from "../lib/utils";
import { supabase } from "../lib/supabase";

export default function TeacherNewsletters() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [newsletters, setNewsletters] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [audience, setAudience] = useState("");
  const [content, setContent] = useState("");
  const [pdfFile, setPdfFile] = useState<string | null>(null);
  const [pdfFileObj, setPdfFileObj] = useState<File | null>(null);
  const [pdfName, setPdfName] = useState("");
  const [editingNewsletterId, setEditingNewsletterId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadNewsletters();
  }, []);

  const loadNewsletters = async () => {
    try {
      setLoading(true);
      
      const userJson = localStorage.getItem('user');
      let authorId = null;
      if (userJson) {
         try {
             const user = JSON.parse(userJson);
             authorId = user.id;
             if (authorId === 'demo') {
                 authorId = 'c4d458f8-ba08-4fc1-bbbf-c4c1eac64068'; // fallback
             }
         } catch(e) {}
      }
      
      let query = supabase.from('newsletters').select('*').order('newsletter_id', { ascending: false });
      if (authorId) {
          query = query.eq('author_id', authorId);
      }

      const { data, error } = await query;
      
      if (error) {
        if (error.code === '42501') {
           console.warn("RLS prevents reading newsletters. Please check table policies.");
        }
        throw error;
      }
      
      if (data) {
        if (authorId) {
             const readStateStr = localStorage.getItem(`news_read_${authorId}`);
             const readState = readStateStr ? JSON.parse(readStateStr) : {};
             let updated = false;
             data.forEach(item => {
                 if (item.status === 'Published' && !readState[item.newsletter_id]) {
                     readState[item.newsletter_id] = true;
                     updated = true;
                 }
             });
             if (updated) {
                 localStorage.setItem(`news_read_${authorId}`, JSON.stringify(readState));
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

  const STATUSES = ["All", "Draft", "Pending Approval", "Published", "Rejected"];

  const filteredNewsletters = newsletters.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || (n.content && n.content.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = activeFilter === "All" || n.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setPdfName(file.name);
        if (file.size > 2 * 1024 * 1024) {
           alert("File is too large for this prototype. Please keep it under 2MB.");
           return;
        }
        setPdfFileObj(file); // Save File object for storage upload
        const reader = new FileReader();
        reader.onloadend = () => {
           setPdfFile(reader.result as string); // Keep base64 for fallback/local storage
        };
        reader.readAsDataURL(file);
     }
  };


  const handleEditInit = (news: any) => {
     setEditingNewsletterId(news.id);
     setTitle(news.title);
     setAudience(news.audience);
     setContent(news.content);
     setPdfName(news.pdfName || "");
     setPdfFile(news.pdfData || null);
     setPdfFileObj(null);
     setShowModal(true);
  };

  const handleSave = async (status: "Draft" | "Pending Approval") => {
     if (!title.trim()) return alert("Title is required");
     
     let finalPdfData = pdfFile;
     
     if (pdfFileObj) {
        const filePath = `${Date.now()}_${pdfFileObj.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
        const { error: uploadError } = await supabase.storage
            .from('newsletter_pdfs')
            .upload(filePath, pdfFileObj, { cacheControl: '3600', upsert: false });
            
        if (!uploadError) {
            const { data } = supabase.storage.from('newsletter_pdfs').getPublicUrl(filePath);
            finalPdfData = data.publicUrl;
        } else {
            console.error("Storage upload failed:", uploadError);
            if (uploadError.statusCode === "404") {
                 alert("Could not upload PDF: Bucket 'newsletter_pdfs' not found. Ensure it exists and is public.");
            } else if (uploadError.message.includes("policy") || uploadError.statusCode === "403") {
                 alert("Could not upload PDF: Upload blocked by storage Row-Level Security policy.");
            }
        }
     }
     
     const userJson = localStorage.getItem('user');
     let authorId = null;
     let authorName = "Teacher";
     if (userJson) {
         try {
             const user = JSON.parse(userJson);
             authorId = user.id;
             authorName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || "Teacher";
             if (authorId === 'demo') {
                 authorId = 'c4d458f8-ba08-4fc1-bbbf-c4c1eac64068'; // fallback
             }
         } catch(e) {}
     }
     
     let classId = null;
     if (authorId) {
         const { data: classData } = await supabase.from('classes').select('class_id').or(`primary_teacher_id.eq.${authorId},co_teacher_id.eq.${authorId},co_teachers.cs.{${authorId}}`).limit(1).maybeSingle();
         if (classData) classId = (classData as any).class_id;
     }

     const payloadProps = {
        content,
        audience,
        status,
        date: new Date().toLocaleDateString(),
        author: authorName, 
        pdfData: finalPdfData,
        pdfName,
        adminComment: null
     };

     try {
       if (editingNewsletterId) {
           const { error } = await supabase.from('newsletters').update({
               title,
               content: JSON.stringify(payloadProps)
           }).eq('newsletter_id', editingNewsletterId);
           if (error) throw error;
           alert("Newsletter successfully updated!");
       } else {
           const { data, error } = await supabase.from('newsletters').insert([{
               title,
               author_id: authorId,
               class_id: classId,
               content: JSON.stringify(payloadProps)
           }] as any).select();
           if (error) {
               if (error.code === '42501') alert("Database Error: Row-Level Security (RLS) is blocking inserts to the 'newsletters' table. Please check policies.");
               throw error;
           }
           alert("Newsletter successfully saved to database!");
       }
       await loadNewsletters();
     } catch (e) {
       console.error("Failed to save newsletter", e);
       alert("Failed to save newsletter");
     }
     
     setShowModal(false);
     setEditingNewsletterId(null);
     setTitle(""); setContent(""); setPdfFile(null); setPdfFileObj(null); setPdfName("");
  };
  const handleDelete = async (id: string | number) => {
     try {
        // @ts-ignore
        const { error } = await supabase.from('newsletters').delete().eq('newsletter_id', id);
        if (error) {
           if (error.code === '42501') alert("RLS blocks deletion. Please check table policies.");
           throw error;
        }
        await loadNewsletters();
     } catch(e) {
        console.error("Delete failed", e);
        alert("Failed to delete newsletter");
     }
  };

  const handleSubmitForApproval = async (id: string | number) => {
     const newsletter = newsletters.find(n => n.id === id);
     if (!newsletter) return;
     
     const updatedProps = { ...newsletter, status: "Pending Approval", adminComment: null };
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
         console.error("Update failed", e);
         alert("Failed to submit newsletter");
     }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto p-6 md:p-8 flex flex-col gap-8 pb-32 md:pb-8">
       {/* Header */}
       <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div>
           <h1 className="font-display text-4xl text-primary font-bold tracking-tight">Class Newsletters</h1>
           <p className="font-body text-lg text-on-surface-variant mt-2">Create newsletters and submit them for approval.</p>
         </div>
         <button onClick={() => { setEditingNewsletterId(null); setTitle(""); setContent(""); setPdfFile(null); setPdfFileObj(null); setPdfName(""); setShowModal(true); }} className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-label font-bold hover:bg-primary/90 transition-colors shadow-md w-full md:w-auto justify-center">
            <Plus className="w-5 h-5" /> Create Newsletter
         </button>
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
               placeholder="Search newsletters..." 
               className="bg-transparent border-none outline-none font-body text-sm w-full"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
          </div>
       </div>

       {/* List / Grid */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredNewsletters.map(news => (
             <div key={news.id} className={cn("bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-6 flex flex-col hover:shadow-md transition-all shadow-sm", news.status === 'Rejected' && "border-error/30")}>
                 <div className="flex justify-between items-start mb-4">
                    <span className={cn(
                       "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-label flex items-center gap-1.5",
                       news.status === "Published" ? "bg-primary-container/20 text-primary border border-primary/20" : 
                       news.status === "Pending Approval" ? "bg-tertiary-container/30 text-tertiary-dim border border-tertiary/20" :
                       news.status === "Rejected" ? "bg-error-container/30 text-error border border-error/20" :
                       "bg-surface-variant text-on-surface-variant border border-outline-variant/30"
                    )}>
                       {news.status === "Published" ? <CheckCircle2 className="w-3 h-3" /> : 
                        news.status === "Pending Approval" ? <Clock className="w-3 h-3" /> :
                        news.status === "Rejected" ? <AlertCircle className="w-3 h-3" /> :
                        <Edit3 className="w-3 h-3" />}
                       {news.status}
                    </span>
                    <div className="flex gap-2">
                       {news.pdfData && (
                           <button onClick={() => setShowPdfModal(news)} className="w-8 h-8 rounded-full hover:bg-primary/10 hover:text-primary flex items-center justify-center text-on-surface-variant transition-colors" title="View PDF">
                               <Eye className="w-4 h-4" />
                           </button>
                       )}
                       {(news.status === "Draft" || news.status === "Rejected") && (
                         <>
                         <button onClick={() => handleEditInit(news)} className="w-8 h-8 rounded-full hover:bg-surface-variant hover:text-primary flex items-center justify-center text-on-surface-variant transition-colors" title="Edit">
                            <Edit3 className="w-4 h-4" />
                         </button>
                         <button onClick={() => handleSubmitForApproval(news.id)} className="w-8 h-8 rounded-full hover:bg-tertiary-container/50 hover:text-tertiary flex items-center justify-center text-on-surface-variant transition-colors" title="Submit for Approval">
                            <Send className="w-4 h-4" />
                         </button>
                         </>
                       )}
                       <button onClick={() => handleDelete(news.id)} className="w-8 h-8 rounded-full hover:bg-error-container/50 hover:text-error flex items-center justify-center text-on-surface-variant transition-colors">
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                 </div>

                 <h3 className="font-display text-xl font-bold text-on-surface mb-2">{news.title}</h3>
                 <p className="font-body text-sm text-on-surface-variant mb-4 line-clamp-3 flex-1">{news.content}</p>
                 
                 {news.pdfName && (
                     <div className="flex items-center gap-2 mb-4 bg-surface-container py-1.5 px-3 rounded-lg w-max max-w-full overflow-hidden">
                         <FileText className="w-4 h-4 text-primary shrink-0" />
                         <span className="text-xs font-mono truncate">{news.pdfName}</span>
                     </div>
                 )}

                 {news.adminComment && (
                     <div className={cn(
                        "mt-2 mb-4 p-3 border rounded-xl",
                        news.status === "Rejected" ? "bg-error-container/20 border-error/30" : "bg-surface-container-low border-outline-variant/30"
                     )}>
                        <p className={cn(
                           "text-xs font-bold uppercase mb-1",
                           news.status === "Rejected" ? "text-error" : "text-on-surface-variant"
                        )}>
                           {news.status === "Rejected" ? "Rejection Reason / Notes:" : "Admin Notes / Description:"}
                        </p>
                        <p className={cn(
                           "text-sm",
                           news.status === "Rejected" ? "text-on-surface-variant" : "text-on-surface"
                        )}>{news.adminComment}</p>
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
                <p className="font-body text-lg text-on-surface font-medium">No newsletters found</p>
             </div>
          )}
       </div>

       {/* Create Modal */}
       {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm animate-in fade-in duration-200">
             <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-6 md:p-8 w-full max-w-2xl shadow-xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between mb-6">
                   <h2 className="text-2xl font-display font-bold text-on-surface">Create Newsletter</h2>
                   <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-surface-variant text-on-surface-variant">
                      <X className="w-5 h-5" />
                   </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                    <div>
                       <label className="block text-sm font-label font-bold text-on-surface mb-2">Title</label>
                       <input 
                          type="text" 
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full bg-surface-container px-4 py-3 rounded-xl border border-outline-variant/30 focus:border-primary outline-none transition-colors"
                          placeholder="e.g. March Updates" 
                       />
                    </div>
                    <div>
                         <label className="block text-sm font-label font-bold text-on-surface mb-2">Target Audience</label>
                         <input 
                            type="text"
                            value={audience}
                            onChange={(e) => setAudience(e.target.value)}
                            className="w-full bg-surface-container px-4 py-3 rounded-xl border border-outline-variant/30 focus:border-primary outline-none transition-colors"
                            placeholder="e.g. All Parents"
                         />
                    </div>
                    <div>
                       <label className="block text-sm font-label font-bold text-on-surface mb-2">Brief Context (Optional)</label>
                       <textarea 
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          className="w-full bg-surface-container px-4 py-3 rounded-xl border border-outline-variant/30 focus:border-primary outline-none transition-colors min-h-[100px] resize-y"
                          placeholder="Provide a short summary..." 
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-label font-bold text-on-surface mb-2">Upload PDF Newsletter</label>
                       <input 
                           type="file" 
                           accept="application/pdf"
                           ref={fileInputRef}
                           className="hidden"
                           onChange={handleFileChange}
                       />
                       <div 
                           onClick={() => fileInputRef.current?.click()}
                           className="w-full border-2 border-dashed border-outline-variant/50 hover:border-primary/50 bg-surface-container-low hover:bg-primary/5 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors"
                       >
                           <FileText className="w-8 h-8 text-on-surface-variant mb-2" />
                           {pdfName ? (
                              <p className="text-sm font-bold text-primary">{pdfName}</p>
                           ) : (
                              <>
                                <p className="text-sm font-bold text-on-surface">Click to attach PDF</p>
                                <p className="text-xs text-on-surface-variant mt-1">Max file size: 2MB</p>
                              </>
                           )}
                       </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-outline-variant/20">
                   <button onClick={() => handleSave("Draft")} className="flex-1 bg-surface-container hover:bg-surface-variant text-on-surface font-bold py-3 px-6 rounded-full transition-colors text-sm">
                      Save as Draft
                   </button>
                   <button onClick={() => handleSave("Pending Approval")} className="flex-[2] bg-primary hover:bg-primary/90 text-on-primary font-bold py-3 px-6 rounded-full transition-colors text-sm flex items-center justify-center gap-2">
                       <Send className="w-4 h-4" />
                       Submit for Approval
                   </button>
                </div>
             </div>
          </div>
       )}

       {/* PDF Viewer Modal */}
       {showPdfModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm animate-in fade-in duration-200">
             <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl w-full max-w-4xl h-[90vh] shadow-xl flex flex-col overflow-hidden mx-auto">
                <div className="flex items-center justify-between p-4 border-b border-outline-variant/20 bg-surface-container-low">
                   <h2 className="text-lg font-display font-bold text-on-surface">{showPdfModal.title}</h2>
                   <button onClick={() => {
                          const w = window.open();
                          if(w) {
                              w.document.write('<iframe src="' + showPdfModal.pdfData + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>');
                              setTimeout(() => { w.print(); }, 500);
                          }
                       }} className="bg-primary text-on-primary hover:bg-primary/90 font-bold py-1.5 px-4 rounded-full transition-colors text-sm flex items-center gap-2 mr-2">
                          <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                          Print
                       </button>
                   <button onClick={() => setShowPdfModal(null)} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-surface-variant text-on-surface-variant">
                      <X className="w-5 h-5" />
                   </button>
                </div>
                <div className="flex-1 bg-surface-container-lowest p-2">
                    <iframe src={showPdfModal.pdfData} className="w-full h-full rounded-xl border border-outline-variant/20" title="PDF Viewer" />
                </div>
             </div>
          </div>
       )}
    </div>
  );
}
