const fs = require('fs');
let code = fs.readFileSync('src/pages/PrincipalNewsletters.tsx', 'utf8');

// 1. Add confirmId state
code = code.replace(
  "const [rejectReason, setRejectReason] = useState(\"\");",
  "const [rejectReason, setRejectReason] = useState(\"\");\n  const [confirmDeleteId, setConfirmDeleteId] = useState<any>(null);"
);

// 2. Update handleDelete
code = code.replace(
  `const handleDelete = async (id: string | number) => {
     if (!window.confirm("Are you sure you want to delete this newsletter?")) return;
     
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
  };`,
  `const handleDelete = async (id: string | number, confirmed: boolean = false) => {
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
  };`
);

// 3. Update the button
code = code.replace(
  `<button onClick={() => handleDelete(news.id)} className="w-8 h-8 rounded-full hover:bg-error-container/50 hover:text-error flex items-center justify-center text-on-surface-variant transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                       </button>`,
  `{confirmDeleteId === news.id ? (
                           <div className="flex items-center gap-1 bg-error-container/20 px-2 rounded-full">
                               <button onClick={() => setConfirmDeleteId(null)} className="text-[10px] font-bold text-on-surface-variant hover:text-on-surface px-1 py-1">Cancel</button>
                               <button onClick={() => handleDelete(news.id, true)} className="text-[10px] font-bold text-error hover:underline px-1 py-1">Confirm</button>
                           </div>
                       ) : (
                       <button onClick={() => setConfirmDeleteId(news.id)} className="w-8 h-8 rounded-full hover:bg-error-container/50 hover:text-error flex items-center justify-center text-on-surface-variant transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                       </button>
                       )}`
);

fs.writeFileSync('src/pages/PrincipalNewsletters.tsx', code);
