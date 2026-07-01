const fs = require('fs');
let content = fs.readFileSync('src/pages/Announcements.tsx', 'utf8');

const regex = /<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"[\s\S]*?<\/div>/;

const replacement = `<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                                               </div>`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/pages/Announcements.tsx', content);
