import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Users, Plus, Trash2, Pencil, Check, X } from "lucide-react";

export default function FamilyTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [showAddFamily, setShowAddFamily] = useState(false);
  const [parentChildRelations, setParentChildRelations] = useState<any[]>([]);
  const [famParentId, setFamParentId] = useState("");
  const [famChildId, setFamChildId] = useState("");
  const [famRelationship, setFamRelationship] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [toastMessage, setToastMessage] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const getRoleName = (userId: string) => {
     const urs = userRoles.filter(ur => ur.user_id === userId);
     const roleNames = urs.map(ur => {
         const r = roles.find(r => r.role_id === ur.role_id);
         return r ? r.role_name : '';
     }).filter(Boolean);
     return roleNames.join(', ');
  };

  const [editingRelation, setEditingRelation] = useState<{parent_id: string, child_id: string} | null>(null);
  const [editRelType, setEditRelType] = useState("");

  const relationshipOptions = [
    "Mother", "Father", "Guardian", "Spouse", "Grandparent", "Sibling", "Aunt", "Uncle", "Other"
  ];

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [u, r, ur, fam] = await Promise.all([
      supabase.from('users').select('user_id, first_name, last_name, email, phone1, status, user_name'),
      supabase.from('roles').select('role_id, role_name'),
      supabase.from('user_roles').select('user_id, role_id'),
      supabase.from('parent_child').select('parent_id, child_id, relationship_type')
    ]);
    if (u.data) setUsers(u.data);
    if (r.data) setRoles(r.data);
    if (ur.data) setUserRoles(ur.data);
    if (fam.data) setParentChildRelations(fam.data);
  }

  async function handleAddFamilySubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    // @ts-ignore
    const { error } = await supabase.from('parent_child').insert([{ parent_id: famParentId, child_id: famChildId, relationship_type: famRelationship }]);
    if (!error) {
      setShowAddFamily(false);
      setFamParentId('');
      setFamChildId('');
      setFamRelationship('');
      showToast("Successfully linked parent and child.", "success");
      fetchData();
    } else {
      if (error.code === '23505' || error.message?.toLowerCase().includes('duplicate')) {
         showToast("Warning: This family relationship already exists.", "error");
      } else {
         showToast(error.message, "error");
      }
    }
  }

  async function handleUpdateRelation() {
     if (!editingRelation) return;
     // @ts-ignore
     const { error } = await supabase.from('parent_child')
         // @ts-ignore
         .update({ relationship_type: editRelType })
         .eq('parent_id', editingRelation.parent_id)
         .eq('child_id', editingRelation.child_id);
     
     if (!error) {
         setEditingRelation(null);
         showToast("Successfully updated relationship.", "success");
         fetchData();
     } else {
         if (error.code === '23505' || error.message?.toLowerCase().includes('duplicate')) {
            showToast("Warning: This family relationship already exists.", "error");
         } else {
            showToast(error.message, "error");
         }
     }
  }

  async function handleDeleteFamily(parentId: string, childId: string) {
    if (!confirm("Are you sure?")) return;
    const { error } = await supabase.from('parent_child').delete().eq('parent_id', parentId).eq('child_id', childId);
    if (!error) {
      showToast("Succesfully deleted relationship.", "success");
      fetchData();
    } else {
      showToast("Failed to delete relationship.", "error");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center bg-surface-container-low p-6 rounded-3xl border border-outline-variant/30">
         <div>
            <h2 className="font-display text-2xl font-bold text-on-surface">Families Directory</h2>
            <p className="font-body text-on-surface-variant mt-1">Manage parent-child relationships.</p>
         </div>
         <button onClick={() => setShowAddFamily(!showAddFamily)} className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-label font-bold flex items-center gap-2">
            <Plus className="w-5 h-5" /> Add Relationship
         </button>
      </div>

      {errorMsg && <div className="bg-orange-100 text-orange-800 border border-orange-200 px-4 py-3 rounded-lg font-body text-sm font-medium">{errorMsg}</div>}

      {showAddFamily && (
        <div className="bg-surface-container-low p-6 md:p-8 rounded-3xl border border-outline-variant/40 shadow-sm relative overflow-hidden">
           <h3 className="font-title text-xl font-bold text-on-surface mb-6">Link Parent & Child</h3>
           <form onSubmit={handleAddFamilySubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-label text-sm font-bold text-on-surface-variant">Select Primary User</label>
                <select required value={famParentId} onChange={(e) => setFamParentId(e.target.value)} className="px-4 py-3 rounded-xl border border-outline-variant/50 popup focus:border-primary outline-none font-body bg-surface text-on-surface">
                   <option value="">-- Select Primary User --</option>
                   {users.map(u => {
                      const role = getRoleName(u.user_id);
                      return (
                        <option key={u.user_id} value={u.user_id}>{u.first_name} {u.last_name} ({u.email || 'No email'}) {role ? `- ${role}` : ''}</option>
                      );
                   })}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label text-sm font-bold text-on-surface-variant">Select Secondary User / Child</label>
                <select required value={famChildId} onChange={(e) => setFamChildId(e.target.value)} className="px-4 py-3 rounded-xl border border-outline-variant/50 popup focus:border-primary outline-none font-body bg-surface text-on-surface">
                   <option value="">-- Select Secondary User --</option>
                   {users.map(u => {
                      const role = getRoleName(u.user_id);
                      return (
                        <option key={u.user_id} value={u.user_id}>{u.first_name} {u.last_name} ({u.email || 'No email'}) {role ? `- ${role}` : ''}</option>
                      );
                   })}
                </select>
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="font-label text-sm font-bold text-on-surface-variant">Relationship Type</label>
                <select required value={famRelationship} onChange={(e) => setFamRelationship(e.target.value)} className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface w-full">
                    <option value="">-- Select Relationship --</option>
                    {relationshipOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="pt-4 flex gap-4 md:col-span-2">
                 <button type="submit" className="bg-primary text-on-primary px-8 py-3 rounded-full font-label font-bold shadow-sm">Save</button>
                 <button type="button" onClick={() => setShowAddFamily(false)} className="border border-outline-variant px-8 py-3 rounded-full font-label font-bold text-on-surface-variant">Cancel</button>
              </div>
           </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {Object.entries(parentChildRelations.reduce((acc, rel) => {
             if (!acc[rel.parent_id]) acc[rel.parent_id] = [];
             acc[rel.parent_id].push(rel);
             return acc;
         }, {} as Record<string, any[]>)).map(([parentId, relations]) => {
            const parent = users.find(u => u.user_id === parentId);
            if (!parent) return null;

            return (
               <div key={`parent-${parentId}`} className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/30 flex flex-col gap-4">
                  <div>
                     <div className="font-label text-xs uppercase tracking-wider text-on-surface-variant mb-1 font-bold">Primary User</div>
                     <div className="font-title text-lg font-bold text-on-surface flex items-center gap-2">
                        {parent.first_name} {parent.last_name}
                     </div>
                  </div>
                  
                  <div className="flex flex-col gap-3 mt-2">
                     <div className="font-label text-xs uppercase tracking-wider text-on-surface-variant font-bold">Linked Users</div>
                     {(relations as any[]).map(rel => {
                         const child = users.find(u => u.user_id === rel.child_id);
                         if (!child) return null;
                         
                         const isEditing = editingRelation?.parent_id === rel.parent_id && editingRelation?.child_id === rel.child_id;
                         
                         return (
                            <div key={`child-${rel.child_id}`} className="flex items-center justify-between bg-surface-container-low p-3 rounded-2xl border border-outline-variant/20">
                               <div className="flex items-center gap-2 flex-wrap">
                                  {isEditing ? (
                                      <select 
                                          value={editRelType} 
                                          onChange={(e) => setEditRelType(e.target.value)}
                                          className="px-2 py-1 rounded border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-sm"
                                      >
                                          <option value="">Select...</option>
                                          {relationshipOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                      </select>
                                  ) : (
                                      <span className="text-primary font-label text-sm uppercase tracking-wide bg-primary-container/20 px-2 py-0.5 rounded">{rel.relationship_type || 'Parent'}</span>
                                  )}
                                  <span className="text-on-surface-variant font-body font-normal">-</span> 
                                  <span className="font-title text-base font-bold text-on-surface">{child.first_name} {child.last_name}</span>
                               </div>
                               <div className="flex items-center gap-1">
                                   {isEditing ? (
                                       <>
                                           <button onClick={() => handleUpdateRelation()} className="text-primary hover:text-primary/80 transition-colors p-1.5 hover:bg-surface-variant rounded-full"><Check className="w-4 h-4" /></button>
                                           <button onClick={() => setEditingRelation(null)} className="text-on-surface-variant hover:text-error transition-colors p-1.5 hover:bg-surface-variant rounded-full"><X className="w-4 h-4" /></button>
                                       </>
                                   ) : (
                                       <>
                                           <button onClick={() => {
                                               setEditingRelation({parent_id: rel.parent_id, child_id: rel.child_id});
                                               setEditRelType(rel.relationship_type || 'Parent');
                                           }} className="text-on-surface-variant hover:text-primary transition-colors p-1.5 hover:bg-surface-variant rounded-full"><Pencil className="w-4 h-4" /></button>
                                           <button onClick={() => handleDeleteFamily(rel.parent_id, rel.child_id)} className="text-on-surface-variant hover:text-error transition-colors p-1.5 hover:bg-surface-variant rounded-full"><Trash2 className="w-4 h-4" /></button>
                                       </>
                                   )}
                               </div>
                            </div>
                         );
                     })}
                  </div>
               </div>
            );
         })}
      </div>
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 p-4 rounded-xl shadow-lg z-50 text-white font-body animate-in fade-in slide-in-from-bottom-8 ${
           toastMessage.type === 'success' ? 'bg-green-600' : 
           toastMessage.type === 'error' ? 'bg-orange-500' : 'bg-blue-500'
        }`}>
          {toastMessage.message}
        </div>
      )}
    </div>
  );
}
