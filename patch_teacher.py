import re

with open('src/pages/TeacherNewsletters.tsx', 'r') as f:
    content = f.read()

# Add state
if 'const [confirmDeleteId, setConfirmDeleteId] = useState' not in content:
    content = content.replace('const [editingNewsletterId, setEditingNewsletterId] = useState<string | null>(null);', 
                              'const [editingNewsletterId, setEditingNewsletterId] = useState<string | null>(null);\n  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);')

# Update handleDelete
bad_handle = """  const handleDelete = async (id: string | number) => {
     try {
        // @ts-ignore
        const { error } = await supabase.from('newsletters').delete().eq('newsletter_id', id);"""

good_handle = """  const handleDelete = async (id: string | number, confirmed: boolean = false) => {
     if (!confirmed) return;
     try {
        // @ts-ignore
        const { error } = await supabase.from('newsletters').delete().eq('newsletter_id', id);"""

if bad_handle in content:
    content = content.replace(bad_handle, good_handle)

# Update button
bad_btn = """                       <button onClick={() => handleDelete(news.id)} className="w-8 h-8 rounded-full hover:bg-error-container/50 hover:text-error flex items-center justify-center text-on-surface-variant transition-colors">
                          <Trash2 className="w-4 h-4" />
                       </button>"""

good_btn = """                       {confirmDeleteId === news.id ? (
                           <div className="flex items-center gap-1 bg-error-container/20 px-2 rounded-full">
                               <button onClick={() => setConfirmDeleteId(null)} className="text-[10px] font-bold text-on-surface-variant hover:text-on-surface px-1 py-1">Cancel</button>
                               <button onClick={() => { setConfirmDeleteId(null); handleDelete(news.id, true); }} className="text-[10px] font-bold text-error hover:underline px-1 py-1">Confirm</button>
                           </div>
                       ) : (
                           <button onClick={() => setConfirmDeleteId(news.id)} className="w-8 h-8 rounded-full hover:bg-error-container/50 hover:text-error flex items-center justify-center text-on-surface-variant transition-colors">
                              <Trash2 className="w-4 h-4" />
                           </button>
                       )}"""

if bad_btn in content:
    content = content.replace(bad_btn, good_btn)

with open('src/pages/TeacherNewsletters.tsx', 'w') as f:
    f.write(content)
print("TeacherNewsletters patched.")
