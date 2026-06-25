const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminUsers.tsx', 'utf8');

// 1. Add confirm state
code = code.replace(
  "const [activeTab, setActiveTab] = useState<'users'|'roles'|'families'|'icons'>('users');",
  "const [activeTab, setActiveTab] = useState<'users'|'roles'|'families'|'icons'>('users');\n  const [confirmUserId, setConfirmUserId] = useState<any>(null);\n  const [confirmRoleId, setConfirmRoleId] = useState<any>(null);\n  const [confirmRelId, setConfirmRelId] = useState<any>(null);"
);

// 2. Update handleDeleteUser
code = code.replace(
  `const handleDeleteUser = async (id: string | number) => {
    if (!confirm("Are you sure?")) return;
    try {
       await supabase.from('user_roles').delete().eq('user_id', id);
       await supabase.from('users').delete().eq('user_id', id);
       loadData();
    } catch(e) {}
  };`,
  `const handleDeleteUser = async (id: string | number, confirmed: boolean = false) => {
    if (!confirmed) return;
    try {
       await supabase.from('user_roles').delete().eq('user_id', id);
       await supabase.from('users').delete().eq('user_id', id);
       setConfirmUserId(null);
       loadData();
    } catch(e) {}
  };`
);

// 3. Update handleDeleteRole
code = code.replace(
  `const handleDeleteRole = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this role?")) return;
    try {
       const { error } = await supabase.from('roles').delete().eq('role_id', id);
       if (error) {
           alert("Cannot delete role: " + error.message);
           return;
       }
       loadData();
    } catch(e) {}
  };`,
  `const handleDeleteRole = async (id: string | number, confirmed: boolean = false) => {
    if (!confirmed) return;
    try {
       const { error } = await supabase.from('roles').delete().eq('role_id', id);
       if (error) {
           return;
       }
       setConfirmRoleId(null);
       loadData();
    } catch(e) {}
  };`
);

// 4. Update handleRemoveParentChild
code = code.replace(
  `const handleRemoveParentChild = async (rel_id: string | number) => {
    if (!confirm("Are you sure you want to remove this relationship?")) return;
    try {
      const { error } = await supabase.from('parent_child').delete().eq('relation_id', rel_id);
      if (error) {
          alert("Error: " + error.message);
          return;
      }
      loadData();
    } catch(e) {}
  };`,
  `const handleRemoveParentChild = async (rel_id: string | number, confirmed: boolean = false) => {
    if (!confirmed) return;
    try {
      const { error } = await supabase.from('parent_child').delete().eq('relation_id', rel_id);
      if (error) {
          return;
      }
      setConfirmRelId(null);
      loadData();
    } catch(e) {}
  };`
);

// 5. Update UI for User delete
code = code.replace(
  `<button onClick={() => handleDeleteUser(u.user_id)} className="w-8 h-8 rounded-full inline-flex items-center justify-center text-on-surface-variant hover:bg-error-container hover:text-error transition-colors" title="Delete User">
                             <Trash2 className="w-4 h-4" />
                           </button>`,
  `{confirmUserId === u.user_id ? (
                               <div className="flex items-center gap-1 bg-error-container/20 px-1 py-0.5 rounded-full">
                                   <button onClick={() => setConfirmUserId(null)} className="text-[10px] font-bold text-on-surface-variant hover:text-on-surface px-1">Cancel</button>
                                   <button onClick={() => handleDeleteUser(u.user_id, true)} className="text-[10px] font-bold text-error hover:underline px-1">Del</button>
                               </div>
                           ) : (
                           <button onClick={() => setConfirmUserId(u.user_id)} className="w-8 h-8 rounded-full inline-flex items-center justify-center text-on-surface-variant hover:bg-error-container hover:text-error transition-colors" title="Delete User">
                             <Trash2 className="w-4 h-4" />
                           </button>
                           )}`
);

// 6. Update UI for Role delete
code = code.replace(
  `<button onClick={() => handleDeleteRole(r.role_id)} className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-error-container hover:text-error transition-colors">
                           <Trash2 className="w-4 h-4" />
                        </button>`,
  `{confirmRoleId === r.role_id ? (
                            <div className="flex items-center gap-1 bg-error-container/20 px-1 py-0.5 rounded-full">
                                <button onClick={() => setConfirmRoleId(null)} className="text-[10px] font-bold text-on-surface-variant hover:text-on-surface px-1">Cancel</button>
                                <button onClick={() => handleDeleteRole(r.role_id, true)} className="text-[10px] font-bold text-error hover:underline px-1">Del</button>
                            </div>
                        ) : (
                        <button onClick={() => setConfirmRoleId(r.role_id)} className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-error-container hover:text-error transition-colors">
                           <Trash2 className="w-4 h-4" />
                        </button>
                        )}`
);

// 7. Update UI for Relationship delete
code = code.replace(
  `<button onClick={() => handleRemoveParentChild(rel.relation_id)} className="w-8 h-8 rounded-full inline-flex items-center justify-center text-on-surface-variant hover:bg-error-container hover:text-error transition-colors" title="Remove Relationship">
                               <Trash2 className="w-4 h-4" />
                            </button>`,
  `{confirmRelId === rel.relation_id ? (
                                <div className="flex items-center gap-1 bg-error-container/20 px-1 py-0.5 rounded-full">
                                    <button onClick={() => setConfirmRelId(null)} className="text-[10px] font-bold text-on-surface-variant hover:text-on-surface px-1">Cancel</button>
                                    <button onClick={() => handleRemoveParentChild(rel.relation_id, true)} className="text-[10px] font-bold text-error hover:underline px-1">Del</button>
                                </div>
                            ) : (
                            <button onClick={() => setConfirmRelId(rel.relation_id)} className="w-8 h-8 rounded-full inline-flex items-center justify-center text-on-surface-variant hover:bg-error-container hover:text-error transition-colors" title="Remove Relationship">
                               <Trash2 className="w-4 h-4" />
                            </button>
                            )}`
);

fs.writeFileSync('src/pages/AdminUsers.tsx', code);
