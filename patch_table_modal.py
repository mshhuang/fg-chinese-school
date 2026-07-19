import re

with open('src/pages/Announcements.tsx', 'r') as f:
    content = f.read()

# Replace emoji modal state with table modal state
state_target = "const [emojiModal, setEmojiModal] = useState<{ isOpen: boolean, quill: any }>({ isOpen: false, quill: null });"
state_replacement = "const [tableModal, setTableModal] = useState<{ isOpen: boolean, quill: any, rows: number, cols: number }>({ isOpen: false, quill: null, rows: 3, cols: 4 });"
content = content.replace(state_target, state_replacement)

# Replace event listeners
event_target = """    const handleQuillEmojiModal = (e: any) => {
        setEmojiModal({ isOpen: true, quill: e.detail.quill });
    };
    document.addEventListener('open-quill-emoji-modal', handleQuillEmojiModal);"""
event_replacement = """    const handleQuillTableModal = (e: any) => {
        setTableModal({ isOpen: true, quill: e.detail.quill, rows: 3, cols: 4 });
    };
    document.addEventListener('open-quill-table-modal', handleQuillTableModal);"""
content = content.replace(event_target, event_replacement)

remove_event_target = "document.removeEventListener('open-quill-emoji-modal', handleQuillEmojiModal);"
remove_event_replacement = "document.removeEventListener('open-quill-table-modal', handleQuillTableModal);"
content = content.replace(remove_event_target, remove_event_replacement)

# Remove Emoji Modal UI and replace with Table Modal UI
emoji_ui_regex = r"\{\/\* Emoji Modal \*\/}.*?(?=\{\/\* Quill Modal \*\/})"
table_ui = """{/* Table Modal */}
       {tableModal.isOpen && (
           <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
               <div className="bg-surface-container-lowest rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                   <div className="flex justify-between items-center p-4 border-b border-outline-variant/30">
                       <h3 className="font-title font-bold text-on-surface flex items-center gap-2">
                           Insert Table
                       </h3>
                       <button onClick={() => setTableModal(prev => ({...prev, isOpen: false}))} className="p-2 text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors"><X className="w-5 h-5" /></button>
                   </div>
                   <div className="p-6 flex flex-col gap-4">
                       <div className="flex items-center gap-4">
                           <div className="flex-1">
                               <label className="block text-sm font-medium text-on-surface mb-1">Rows</label>
                               <input type="number" min="1" max="10" value={tableModal.rows} onChange={e => setTableModal(prev => ({...prev, rows: parseInt(e.target.value) || 1}))} className="w-full px-3 py-2 bg-surface rounded-xl border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/50" />
                           </div>
                           <div className="flex-1">
                               <label className="block text-sm font-medium text-on-surface mb-1">Columns</label>
                               <input type="number" min="1" max="10" value={tableModal.cols} onChange={e => setTableModal(prev => ({...prev, cols: parseInt(e.target.value) || 1}))} className="w-full px-3 py-2 bg-surface rounded-xl border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/50" />
                           </div>
                       </div>
                       
                       <div className="flex justify-end gap-3 mt-2">
                           <button onClick={() => setTableModal(prev => ({...prev, isOpen: false}))} className="px-4 py-2 rounded-full font-label text-sm hover:bg-surface-variant font-bold">Cancel</button>
                           <button onClick={() => {
                               if (tableModal.quill) {
                                   const table = tableModal.quill.getModule('table');
                                   if (table) {
                                       table.insertTable(tableModal.rows, tableModal.cols);
                                   }
                               }
                               setTableModal(prev => ({...prev, isOpen: false}));
                           }} className="bg-primary text-on-primary px-4 py-2 rounded-full font-label font-bold text-sm hover:bg-primary/90 shadow-sm">Insert</button>
                       </div>
                   </div>
               </div>
           </div>
       )}
       """

import re
content = re.sub(emoji_ui_regex, table_ui, content, flags=re.DOTALL)

with open('src/pages/Announcements.tsx', 'w') as f:
    f.write(content)
