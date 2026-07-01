import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Users, Plus, Trash2, Mail, Phone, Globe, FileText, Pencil, Filter, Wand2, Eye, EyeOff } from "lucide-react";

export default function UserDirectoryTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [filterRole, setFilterRole] = useState<string>("All");
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [showFormPassword, setShowFormPassword] = useState(false);

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const [formData, setFormData] = useState({
    email: '', first_name: '', last_name: '', phone1: '', phone2: '',
    school: '', grade: '', dob: '', user_name: '', password_hash: '', address: '',
    emergency_contact: '', medical_condition: '', status: 'Active'
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  async function fetchRoles() {
    const { data } = await supabase.from('roles').select('*');
    if (data) {
      setRoles(data);
    }
  }

  async function fetchUsers() {
    setLoading(true);
    
    const [usersRes, mappingsRes, rolesRes] = await Promise.all([
      supabase.from('users').select('*').order('created_at', { ascending: false }),
      supabase.from('user_roles').select('*'),
      supabase.from('roles').select('*')
    ]);

    if (usersRes.error) {
      setErrorMsg("Failed to load users: " + usersRes.error.message);
    }
    
    if (mappingsRes.error) {
      console.error("user_roles fetch error:", mappingsRes.error);
      setErrorMsg("Failed to load roles mapping: " + mappingsRes.error.message);
    }

    const allUsers = usersRes.data || [];
    const mappings = mappingsRes.data || [];
    const allRoles = rolesRes.data || [];

    setUsers(allUsers);
    setUserRoles(mappings);
    setLoading(false);
  }

  async function generateUsername() {
    if (!formData.first_name) {
      setErrorMsg("Please enter First Name to generate a username.");
      return;
    }

    const baseName = (formData.first_name.charAt(0) + (formData.last_name || '')).toLowerCase().replace(/[^a-z0-9]/g, '');
    let uniqueName = baseName;
    let counter = 1;
    let isUnique = false;

    setLoading(true);
    while (!isUnique) {
      const { data, error } = await supabase
        .from('users')
        .select('user_name')
        .eq('user_name', uniqueName)
        .maybeSingle();

      if (error) {
        console.error("Error checking username:", error);
        setErrorMsg("Failed to generate username.");
        break;
      }

      if (!data) {
        isUnique = true;
      } else {
        uniqueName = `${baseName}${counter}`;
        counter++;
      }
    }
    setLoading(false);

    if (isUnique) {
      setFormData(prev => ({ ...prev, user_name: uniqueName }));
    }
  }

  async function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    const payload = {
      ...formData,
      email: formData.email || null,
      phone1: formData.phone1 || null,
      phone2: formData.phone2 || null,
      school: formData.school || null,
      grade: formData.grade || null,
      dob: formData.dob || null,
      user_name: formData.user_name || null,
      address: formData.address || null,
      emergency_contact: formData.emergency_contact || null,
      medical_condition: formData.medical_condition || null,
      password_hash: formData.password_hash || null,
    };
    try {
      let error;
      let finalUserId = editingUserId;
      if (editingUserId) {
        // @ts-ignore
        const { error: updateError } = await supabase.from('users').update(payload).eq('user_id', editingUserId);
        error = updateError;
      } else {
        finalUserId = crypto.randomUUID();
        // @ts-ignore
        const { error: insertError } = await supabase.from('users').insert([{ ...payload, user_id: finalUserId }]);
        error = insertError;
      }
      
      if (!error) {
        if (finalUserId) {
          await supabase.from('user_roles').delete().eq('user_id', finalUserId);
          if (selectedRoleIds.length > 0) {
            const roleInserts = selectedRoleIds.map(rId => ({ user_id: finalUserId, role_id: rId }));
            await supabase.from('user_roles').insert(roleInserts);
          }
        }
        setShowAdd(false);
        setEditingUserId(null);
        setSelectedRoleIds([]);
        fetchUsers();
      } else {
        setErrorMsg("Error: " + error.message);
      }
    } catch (err: any) {
      setErrorMsg("Error: " + err.message);
    }
  }

  function handleEdit(user: any) {
    setEditingUserId(user.user_id);
    setFormData({
      email: user.email || '', first_name: user.first_name, last_name: user.last_name,
      phone1: user.phone1 || '', phone2: user.phone2 || '', school: user.school || '',
      grade: user.grade || '', dob: user.dob || '', user_name: user.user_name || '',
      password_hash: user.password_hash || '', address: user.address || '',
      emergency_contact: user.emergency_contact || '', medical_condition: user.medical_condition || '', status: user.status as any,
    });
    const currentRoleIds = userRoles.filter(ur => ur.user_id === user.user_id).map(ur => ur.role_id);
    setSelectedRoleIds(currentRoleIds);
    setShowAdd(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure?")) return;
    await supabase.from('users').delete().eq('user_id', id);
    fetchUsers();
  }

  const filteredUsers = users.filter(user => {
    const userRoleMappings = userRoles.filter(ur => ur.user_id === user.user_id);
    
    if (filterRole === "All") return true;
    if (filterRole === "Unassigned") return userRoleMappings.length === 0;

    return userRoleMappings.some(ur => {
       const r = roles.find(role => role.role_id === ur.role_id);
       return r && r.role_name.toLowerCase() === filterRole.toLowerCase();
    });
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center bg-surface-container-low p-6 rounded-3xl border border-outline-variant/30">
         <div>
            <h2 className="font-display text-2xl font-bold text-on-surface">Users Directory</h2>
            <p className="font-body text-on-surface-variant mt-1">Manage system accounts.</p>
         </div>
         <button onClick={() => { 
            setShowAdd(!showAdd); 
            setEditingUserId(null); 
            setErrorMsg(""); 
            if (!showAdd) {
               setFormData({
                 email: '', first_name: '', last_name: '', phone1: '', phone2: '',
                 school: '', grade: '', dob: '', user_name: '', password_hash: '', address: '',
                 emergency_contact: '', medical_condition: '', status: 'Active'
               });
               setSelectedRoleIds([]);
            }
         }} className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-label font-bold flex items-center gap-2">
            <Plus className="w-5 h-5" /> Add User
         </button>
      </div>

      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          {["All", ...roles.map(r => r.role_name), "Unassigned"].map(rName => (
             <button
                key={rName}
                onClick={() => setFilterRole(rName)}
                className={`px-4 py-2 rounded-full font-label text-sm font-bold whitespace-nowrap transition-colors ${
                  filterRole === rName 
                    ? 'bg-primary text-on-primary' 
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-variant'
                }`}
             >
                {rName}
             </button>
          ))}
      </div>

      {errorMsg && <div className="bg-orange-100 text-orange-800 border border-orange-200 px-4 py-3 rounded-lg font-body text-sm font-medium">{errorMsg}</div>}

      {showAdd && (
         <div className="bg-surface-container-low p-6 md:p-8 rounded-3xl border border-outline-variant/40 shadow-sm relative overflow-hidden">
            <h3 className="font-title text-xl font-bold text-on-surface mb-6">{editingUserId ? 'Edit User' : 'Create New User'}</h3>
            <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="flex flex-col gap-2">
                 <label className="font-label text-sm font-bold text-on-surface-variant">First Name</label>
                 <input required type="text" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface" />
               </div>
               <div className="flex flex-col gap-2">
                 <label className="font-label text-sm font-bold text-on-surface-variant">Last Name</label>
                 <input type="text" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface" />
               </div>
               <div className="flex flex-col gap-2">
                 <label className="font-label text-sm font-bold text-on-surface-variant">Email</label>
                 <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface" />
               </div>
               <div className="flex flex-col gap-2">
                 <label className="font-label text-sm font-bold text-on-surface-variant">Username</label>
                 <div className="flex gap-2">
                   <input type="text" value={formData.user_name} onChange={(e) => setFormData({...formData, user_name: e.target.value})} className="flex-1 px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface" />
                   <button type="button" onClick={generateUsername} disabled={loading} className="px-4 py-3 bg-surface-container hover:bg-surface-container-high border border-outline-variant/50 rounded-xl text-on-surface-variant disabled:opacity-50 transition-colors shrink-0" title="Generate Username">
                     <Wand2 className="w-5 h-5" />
                   </button>
                 </div>
               </div>
               <div className="flex flex-col gap-2">
                 <label className="font-label text-sm font-bold text-on-surface-variant">Date of Birth</label>
                 <input type="date" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface" />
               </div>
               <div className="flex flex-col gap-2">
                 <label className="font-label text-sm font-bold text-on-surface-variant">Primary Phone</label>
                 <input type="tel" value={formData.phone1} onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    let formatted = val;
                    if (val.length > 0 && val.length < 4) {
                      formatted = `(${val}`;
                    } else if (val.length >= 4 && val.length <= 6) {
                      formatted = `(${val.slice(0,3)}) ${val.slice(3)}`;
                    } else if (val.length >= 7) {
                      formatted = `(${val.slice(0,3)}) ${val.slice(3,6)}-${val.slice(6,10)}`;
                    }
                    setFormData({...formData, phone1: formatted});
                 }} className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface" placeholder="(212) 123-4567" />
               </div>
               <div className="flex flex-col gap-2">
                 <label className="font-label text-sm font-bold text-on-surface-variant">Secondary Phone</label>
                 <input type="tel" value={formData.phone2} onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    let formatted = val;
                    if (val.length > 0 && val.length < 4) {
                      formatted = `(${val}`;
                    } else if (val.length >= 4 && val.length <= 6) {
                      formatted = `(${val.slice(0,3)}) ${val.slice(3)}`;
                    } else if (val.length >= 7) {
                      formatted = `(${val.slice(0,3)}) ${val.slice(3,6)}-${val.slice(6,10)}`;
                    }
                    setFormData({...formData, phone2: formatted});
                 }} className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface" placeholder="(212) 123-4567" />
               </div>
               <div className="flex flex-col gap-2 md:col-span-2">
                 <label className="font-label text-sm font-bold text-on-surface-variant">Address</label>
                 <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface" />
               </div>
               <div className="flex flex-col gap-2 md:col-span-2">
                 <label className="font-label text-sm font-bold text-on-surface-variant">Emergency Contact</label>
                 <input type="text" value={formData.emergency_contact} onChange={(e) => setFormData({...formData, emergency_contact: e.target.value})} className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface" />
               </div>
               <div className="flex flex-col gap-2">
                 <label className="font-label text-sm font-bold text-on-surface-variant">Password</label>
                 <div className="relative">
                   <input type={showFormPassword ? "text" : "password"} value={formData.password_hash} onChange={(e) => setFormData({...formData, password_hash: e.target.value})} placeholder="Leave blank to skip" className="w-full px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface pr-12" />
                   <button type="button" onClick={() => setShowFormPassword(!showFormPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors focus:outline-none" title={showFormPassword ? "Hide Password" : "Show Password"}>
                     {showFormPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                   </button>
                 </div>
               </div>
               <div className="flex flex-col gap-2">
                 <label className="font-label text-sm font-bold text-on-surface-variant">Status</label>
                 <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Graduated">Graduated</option>
                    <option value="Left">Left</option>
                 </select>
               </div>
               <div className="flex flex-col gap-2 md:col-span-2">
                 <label className="font-label text-sm font-bold text-on-surface-variant">Assign Roles</label>
                 <div className="flex flex-wrap gap-4 mt-2">
                   {roles.map(role => (
                     <label key={role.role_id} className="flex items-center gap-2 cursor-pointer">
                       <input 
                         type="checkbox" 
                         checked={selectedRoleIds.includes(role.role_id)}
                         onChange={(e) => {
                           if (e.target.checked) setSelectedRoleIds([...selectedRoleIds, role.role_id]);
                           else setSelectedRoleIds(selectedRoleIds.filter(id => id !== role.role_id));
                         }}
                         className="w-4 h-4 text-primary rounded border-outline-variant"
                       />
                       <span className="font-body text-sm text-on-surface">{role.role_name}</span>
                     </label>
                   ))}
                 </div>
               </div>
               {selectedRoleIds.some(roleId => roles.find(r => r.role_id === roleId)?.role_name?.toLowerCase() === 'student') && (
                 <>
                   <div className="flex flex-col gap-2 md:col-span-2 mt-4 pt-4 border-t border-outline-variant/30">
                     <h4 className="font-label font-bold text-base text-on-surface">Student Details</h4>
                   </div>
                   <div className="flex flex-col gap-2">
                     <label className="font-label text-sm font-bold text-on-surface-variant">School</label>
                     <input type="text" value={formData.school} onChange={(e) => setFormData({...formData, school: e.target.value})} className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface" />
                   </div>
                   <div className="flex flex-col gap-2">
                     <label className="font-label text-sm font-bold text-on-surface-variant">Grade</label>
                     <input type="text" value={formData.grade} onChange={(e) => setFormData({...formData, grade: e.target.value})} className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface" />
                   </div>
                   <div className="flex flex-col gap-2 md:col-span-2">
                     <label className="font-label text-sm font-bold text-on-surface-variant">Medical Condition</label>
                     <textarea value={formData.medical_condition} onChange={(e) => setFormData({...formData, medical_condition: e.target.value})} className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface min-h-[80px]" />
                   </div>
                 </>
               )}
               <div className="md:col-span-2 pt-4 flex gap-4">
                  <button type="submit" className="bg-primary text-on-primary px-8 py-3 rounded-full font-label font-bold shadow-sm hover:bg-primary/90 transition-colors">{editingUserId ? 'Update User' : 'Save User'}</button>
                  <button type="button" onClick={() => setShowAdd(false)} className="border border-outline-variant px-8 py-3 rounded-full font-label font-bold text-on-surface-variant hover:bg-surface-variant transition-colors">Cancel</button>
               </div>
            </form>
         </div>
      )}

      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl overflow-hidden shadow-sm">
         <div className="overflow-x-auto overflow-y-auto max-h-[600px] p-0">
           <table className="w-full text-left border-collapse min-w-[700px] relative">
             <thead className="sticky top-0 z-10">
               <tr className="bg-surface-container-low border-b border-outline-variant/30 text-on-surface-variant shadow-sm">
                 <th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Name</th>
                 <th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Contact</th>
                 <th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Details</th>
                 <th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Password</th>
                 <th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Roles</th>
                 <th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Status</th>
                 <th className="p-4 font-label text-xs uppercase tracking-wider font-bold text-right">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-outline-variant/20">
               {loading ? <tr><td colSpan={7} className="p-8 text-center text-on-surface-variant font-body">Loading...</td></tr> : 
                filteredUsers.length === 0 ? <tr><td colSpan={7} className="p-8 text-center text-on-surface-variant font-body">No users found. Create one above!</td></tr> :
                filteredUsers.map(user => (
                 <tr key={user.user_id} className="hover:bg-surface-variant/30 transition-colors">
                   <td className="p-4">
                      <div className="font-label font-bold text-on-surface">{user.first_name} {user.last_name}</div>
                   </td>
                   <td className="p-4 font-body text-sm text-on-surface-variant">{user.email}</td>
                   <td className="p-4 font-body text-xs text-on-surface-variant">
                     {user.school && <div><span className="font-bold">School:</span> {user.school}</div>}
                     {user.grade && <div><span className="font-bold">Grade:</span> {user.grade}</div>}
                     {user.medical_condition && <div className="text-error" title={user.medical_condition}><span className="font-bold">Med:</span> {user.medical_condition.length > 20 ? user.medical_condition.substring(0, 20) + '...' : user.medical_condition}</div>}
                     {!user.school && !user.grade && !user.medical_condition && <span>-</span>}
                   </td>
                   <td className="p-4 font-mono text-xs text-on-surface">
                     <div className="flex items-center gap-2">
                       {user.password_hash ? (
                         <>
                           <span>{visiblePasswords[user.user_id] ? user.password_hash : '••••••••'}</span>
                           <button 
                             onClick={() => togglePasswordVisibility(user.user_id)}
                             className="text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
                             title={visiblePasswords[user.user_id] ? "Hide Password" : "Show Password"}
                           >
                             {visiblePasswords[user.user_id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                           </button>
                         </>
                       ) : (
                         <span className="text-on-surface-variant opacity-60">Not set</span>
                       )}
                     </div>
                   </td>
                   <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {userRoles.filter(ur => ur.user_id === user.user_id).map(ur => {
                           const r = roles.find(role => role.role_id === ur.role_id);
                           return r ? <span key={r.role_id} className="bg-primary/10 text-primary px-2 py-0.5 rounded-md font-label text-[10px] font-bold">{r.role_name}</span> : null;
                        })}
                      </div>
                   </td>
                   <td className="p-4 font-label text-xs font-bold">{user.status}</td>
                   <td className="p-4 text-right">
                      <button onClick={() => handleEdit(user)} className="w-8 h-8 rounded-full text-on-surface-variant hover:text-primary"><Pencil className="w-4 h-4 mx-auto" /></button>
                      <button onClick={() => handleDelete(user.user_id)} className="w-8 h-8 rounded-full text-on-surface-variant hover:text-error"><Trash2 className="w-4 h-4 mx-auto" /></button>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
      </div>
    </div>
  );
}
