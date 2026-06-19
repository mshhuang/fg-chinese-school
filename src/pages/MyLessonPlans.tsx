import { useState, useEffect } from "react";
import { ExternalLink, Save, FileText, LayoutDashboard } from "lucide-react";

export default function MyLessonPlans() {
  const [savedUrl, setSavedUrl] = useState(() => {
    return localStorage.getItem("lessonPlansGoogleDoc") || "https://docs.google.com/document/d/1P5mYp60_e_iE_1QnN-l0XhZ2T0xM-W90QhS_C-XU-Hk/edit";
  });
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [tempUrl, setTempUrl] = useState(savedUrl);

  const handleSave = () => {
    setSavedUrl(tempUrl);
    localStorage.setItem("lessonPlansGoogleDoc", tempUrl);
    setIsEditingUrl(false);
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto p-6 md:p-8 flex flex-col gap-8 lg:h-screen lg:overflow-hidden pb-32 md:pb-8 opacity-50 grayscale pointer-events-none" title="Coming Soon">
       {/* Header */}
       <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
         <div>
           <h1 className="font-display text-4xl text-primary font-bold tracking-tight">My Lesson Plans</h1>
           <p className="font-body text-lg text-on-surface-variant mt-2">Manage and collaborate on your curriculum via Google Docs.</p>
         </div>
       </header>

       {/* Link Manager */}
       <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-6 flex flex-col gap-4 shrink-0 shadow-sm">
         <div className="font-title text-lg text-on-surface font-bold flex items-center gap-2">
           <FileText className="w-5 h-5 text-primary" /> Google Document Link
         </div>
         <p className="font-body text-sm text-on-surface-variant">
           Share a Google Doc link with Edit access for collaboration between teachers and administrators.
         </p>

         <div className="flex items-center gap-4 mt-2">
           {isEditingUrl ? (
             <div className="flex-1 flex gap-2">
               <input 
                 type="text" 
                 value={tempUrl} 
                 onChange={(e) => setTempUrl(e.target.value)} 
                 className="flex-1 bg-surface border border-outline-variant/50 rounded-xl px-4 py-2 font-body text-on-surface outline-none focus:border-primary shadow-sm"
                 placeholder="Paste Google Doc sharing link here..."
                 autoFocus
               />
               <button onClick={handleSave} className="bg-primary text-on-primary px-6 py-2 rounded-xl font-label font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm">
                 <Save className="w-4 h-4" /> Save
               </button>
             </div>
           ) : (
             <div className="flex-1 flex flex-col md:flex-row items-start md:items-center justify-between bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 gap-4">
               <div className="flex items-center gap-3 overflow-hidden w-full">
                 <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                   <FileText className="w-4 h-4 text-blue-600" />
                 </div>
                 <span className="font-body text-on-surface truncate text-sm md:text-base">{savedUrl || "No document linked yet."}</span>
               </div>
               <div className="flex gap-2 shrink-0 w-full md:w-auto">
                 <button onClick={() => setIsEditingUrl(true)} className="flex-1 md:flex-none px-4 py-2 rounded-lg border border-outline-variant hover:bg-surface-variant font-label text-sm font-bold transition-colors">
                   Edit Link
                 </button>
                 <a href={savedUrl} target="_blank" rel="noopener noreferrer" className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 focus:ring-4 focus:ring-blue-300 text-white px-4 py-2 rounded-lg font-label text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
                   <ExternalLink className="w-4 h-4" /> Open Document
                 </a>
               </div>
             </div>
           )}
         </div>
       </div>

       {/* Iframe View (Attempt) */}
       <div className="flex-1 bg-surface-container-low rounded-3xl overflow-hidden border border-outline-variant/30 shadow-inner relative flex flex-col min-h-[400px]">
          <div className="p-4 bg-surface-container-lowest border-b border-outline-variant/30 flex items-center justify-between">
            <span className="font-label text-sm text-on-surface font-bold flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" /> Document Preview
            </span>
            <span className="font-caption text-xs text-on-surface-variant">
              If it doesn't load securely, use the 'Open Document' button above.
            </span>
          </div>

          <iframe 
             src={savedUrl} 
             title="Lesson Plans Document"
             className="w-full flex-1 border-none"
             sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
          
          {/* Overlay to inform users if doc isn't showing */}
          <div className="absolute inset-x-0 bottom-0 top-[60px] pointer-events-none flex items-center justify-center z-[-1] bg-surface-container-lowest">
            <div className="text-center p-8 max-w-md">
              <FileText className="w-16 h-16 opacity-10 mx-auto mb-4" />
              <h3 className="font-title text-xl text-on-surface font-bold mb-2">Google Docs Viewer</h3>
              <p className="font-body text-on-surface-variant">
                If the document does not render in this frame due to Google's security settings, please use the Open Document button above to view or edit it securely in a new tab.
              </p>
            </div>
          </div>
       </div>
    </div>
  );
}
