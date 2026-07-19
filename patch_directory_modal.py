with open('src/components/admin/UserDirectoryTab.tsx', 'r') as f:
    content = f.read()

target_start = """      {showAdd && (
         <div id="edit-user-form" className="bg-surface-container-low p-6 md:p-8 rounded-3xl border border-outline-variant/40 shadow-sm relative overflow-hidden">
            <h3 className="font-title text-xl font-bold text-on-surface mb-6">{editingUserId ? 'Edit User' : 'Create New User'}</h3>"""

replacement_start = """      {showAdd && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-container-lowest p-6 md:p-8 border-l border-outline-variant/40 shadow-2xl relative overflow-y-auto w-full max-w-2xl h-full transition-transform transform translate-x-0">
           <div className="flex justify-between items-center mb-6">
             <h3 className="font-title text-xl font-bold text-on-surface">{editingUserId ? 'Edit User' : 'Create New User'}</h3>
             <button type="button" onClick={() => setShowAdd(false)} className="text-on-surface-variant hover:text-on-surface"><X className="w-6 h-6" /></button>
           </div>"""

content = content.replace(target_start, replacement_start)

target_end = """               </div>
            </form>
         </div>
      )}"""

replacement_end = """               </div>
            </form>
          </div>
        </div>
      )}"""

content = content.replace(target_end, replacement_end)

with open('src/components/admin/UserDirectoryTab.tsx', 'w') as f:
    f.write(content)

