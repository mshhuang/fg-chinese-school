const fs = require('fs');
let code = fs.readFileSync('src/pages/Announcements.tsx', 'utf8');

// 1. Add confirmId state
code = code.replace(
  "const [classComments, setClassComments] = useState<any[]>([]);",
  "const [classComments, setClassComments] = useState<any[]>([]);\n  const [confirmDeleteId, setConfirmDeleteId] = useState<any>(null);\n  const [confirmCommentDeleteId, setConfirmCommentDeleteId] = useState<any>(null);"
);

// 2. Update handleDelete
code = code.replace(
  `const handleDeleteAnnouncement = async (ann_id: string | number) => {
      if (!confirm("Are you sure you want to delete this announcement? This will also delete all class comments to it.")) return;

      try {
          const { error } = await supabase.from('announcements').delete().eq('announcement_id', ann_id);
          if (error) throw error;
          
          await fetchAnnouncements();
      } catch(e) {
          console.error("Delete failed", e);
      }
  };`,
  `const handleDeleteAnnouncement = async (ann_id: string | number, confirmed: boolean = false) => {
      if (!confirmed) return;

      try {
          const { error } = await supabase.from('announcements').delete().eq('announcement_id', ann_id);
          if (error) throw error;
          
          setConfirmDeleteId(null);
          await fetchAnnouncements();
      } catch(e) {
          console.error("Delete failed", e);
      }
  };`
);

code = code.replace(
  `const handleDeleteComment = async (comment_id: string | number) => {
      if (!confirm("Are you sure you want to delete this class comment?")) return;
      
      try {
          const { error } = await supabase.from('class_announcement_comments').delete().eq('comment_id', comment_id);
          if (error) throw error;
          
          await fetchComments();
      } catch(e) {
          console.error("Delete failed", e);
      }
  };`,
  `const handleDeleteComment = async (comment_id: string | number, confirmed: boolean = false) => {
      if (!confirmed) return;
      
      try {
          const { error } = await supabase.from('class_announcement_comments').delete().eq('comment_id', comment_id);
          if (error) throw error;
          
          setConfirmCommentDeleteId(null);
          await fetchComments();
      } catch(e) {
          console.error("Delete failed", e);
      }
  };`
);


// 3. Update the buttons
// Announcement delete button
code = code.replace(
  `<button onClick={(e) => { e.stopPropagation(); handleDeleteAnnouncement(ann.announcement_id); }} className="w-8 h-8 rounded-full hover:bg-error-container/50 hover:text-error flex items-center justify-center text-on-surface-variant transition-colors" title="Delete Announcement">
                               <Trash2 className="w-4 h-4" />
                            </button>`,
  `{confirmDeleteId === ann.announcement_id ? (
                               <div className="flex items-center gap-1 bg-error-container/20 px-2 py-1 rounded-full" onClick={(e) => e.stopPropagation()}>
                                   <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }} className="text-[10px] font-bold text-on-surface-variant hover:text-on-surface px-1">Cancel</button>
                                   <button onClick={(e) => { e.stopPropagation(); handleDeleteAnnouncement(ann.announcement_id, true); }} className="text-[10px] font-bold text-error hover:underline px-1">Confirm</button>
                               </div>
                            ) : (
                            <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(ann.announcement_id); }} className="w-8 h-8 rounded-full hover:bg-error-container/50 hover:text-error flex items-center justify-center text-on-surface-variant transition-colors" title="Delete Announcement">
                               <Trash2 className="w-4 h-4" />
                            </button>
                            )}`
);

// Comment delete button
code = code.replace(
  `<button onClick={() => handleDeleteComment(cmt.comment_id)} className="w-6 h-6 rounded-full hover:bg-error-container/50 hover:text-error flex items-center justify-center text-on-surface-variant transition-colors" title="Delete Comment">
                                               <Trash2 className="w-3 h-3" />
                                            </button>`,
  `{confirmCommentDeleteId === cmt.comment_id ? (
                                            <div className="flex items-center gap-1 bg-error-container/20 px-1 py-0.5 rounded-full">
                                               <button onClick={() => setConfirmCommentDeleteId(null)} className="text-[9px] font-bold text-on-surface-variant hover:text-on-surface px-1">Cancel</button>
                                               <button onClick={() => handleDeleteComment(cmt.comment_id, true)} className="text-[9px] font-bold text-error hover:underline px-1">Del</button>
                                            </div>
                                            ) : (
                                            <button onClick={() => setConfirmCommentDeleteId(cmt.comment_id)} className="w-6 h-6 rounded-full hover:bg-error-container/50 hover:text-error flex items-center justify-center text-on-surface-variant transition-colors" title="Delete Comment">
                                               <Trash2 className="w-3 h-3" />
                                            </button>
                                            )}`
);

fs.writeFileSync('src/pages/Announcements.tsx', code);
