import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Users, Plus, Trash2, Mail, Phone, Globe, FileText, Pencil, Wand2, Check, X, School, Shield, Link, Home, Briefcase, Heart, Wrench, User as UserIcon, Search, Eye, EyeOff } from "lucide-react";
import { Database } from "../lib/database.types";
import { BuilderIconCustom, AdminIconCustom, StaffIconCustom, VolunteerIconCustom, TeacherIconCustom, StudentIconCustom } from "../components/icons";
import { logSystemActivity } from "../lib/logger";

type User = Database['public']['Tables']['users']['Row'];

const getRoleIcon = (roleName: string, sizeClass: string) => {
    const roleLower = roleName.toLowerCase();
    switch (roleLower) {
        case 'admin':
        case 'principal': return <AdminIconCustom className={sizeClass} />;
        case 'builder': return <BuilderIconCustom className={sizeClass} />;
        case 'teacher': return <TeacherIconCustom className={sizeClass} />;
        case 'parent': return <Home className={sizeClass} />;
        case 'staff': return <StaffIconCustom className={sizeClass} />;
        case 'volunteer': return <VolunteerIconCustom className={sizeClass} />;
        case 'student': return <StudentIconCustom className={sizeClass} />;
        default: return <UserIcon className={sizeClass} />;
    }
};

import { useNavigate } from 'react-router-dom';
import RoleIconsTab from '../components/admin/RoleIconsTab';

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [roles, setRoles] = useState<{ role_id: number; role_name: string }[]>([]);
  const [userRoles, setUserRoles] = useState<{ user_id: string; role_id: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showAddRole, setShowAddRole] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'families' | 'icons'>('users');
  const [roleName, setRoleName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [toastMessage, setToastMessage] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [showFormPassword, setShowFormPassword] = useState(false);

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

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
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [filterRole, setFilterRole] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [showAddFamily, setShowAddFamily] = useState(false);
  const [parentChildRelations, setParentChildRelations] = useState<any[]>([]);
  const [famParentId, setFamParentId] = useState("");
  const [famChildId, setFamChildId] = useState("");
  const [famRelationship, setFamRelationship] = useState("");
  const [editingRelation, setEditingRelation] = useState<{parent_id: string, child_id: string} | null>(null);
  const [editRelType, setEditRelType] = useState("");
  
  const relationshipOptions = [
    "Mother", "Father", "Guardian", "Spouse", "Grandparent", "Sibling", "Aunt", "Uncle", "Other"
  ];

  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone1: '',
    phone2: '',
    school: '',
    grade: '',
    dob: '',
    user_name: '',
    password_hash: '',
    address: '',
    emergency_contact: '',
    medical_condition: '',
    status: 'Active' as const,
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchFamilies();
    fetchClasses();
    setErrorMsg("");
    setShowAdd(false);
    setShowAddRole(false);
    setShowAddFamily(false);
  }, [activeTab]);

  async function fetchClasses() {
    const { data, error } = await supabase.from('classes').select('class_id');
    if (data) setClasses(data);
  }

  async function fetchFamilies() {
    const { data, error } = await supabase.from('parent_child').select('*');
    if (error) {
       console.error("Error fetching families:", error.message);
    }
    if (data) setParentChildRelations(data);
  }

  async function fetchRoles() {
    setLoading(true);
    const { data, error } = await supabase.from('roles').select('*').order('role_id', { ascending: false });
    if (data) {
        const u = localStorage.getItem("user");
        let isBuilder = false;
        if (u) {
            try {
                const parsed = JSON.parse(u);
                if (parsed.role === 'builder' || parsed.availableRoles?.includes('builder')) {
                    isBuilder = true;
                }
            } catch(e) {}
        }
        if (!isBuilder) {
            setRoles(data.filter((r: any) => r.role_name.toLowerCase() !== 'builder'));
        } else {
            setRoles(data);
        }
    }
    setLoading(false);
  }

  async function fetchUsers() {
    setLoading(true);
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (data) setUsers(data);
    
    const { data: mappings, error: mapErr } = await supabase.from('user_roles').select('*');
    if (mapErr) {
       setErrorMsg("Failed to load user roles: " + mapErr.message);
    }
    if (mappings) setUserRoles(mappings);
    setLoading(false);
  }

  async function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
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
    
    if (payload.user_name) {
      let query = supabase.from('users').select('user_id').eq('user_name', payload.user_name);
      if (editingUserId) {
        query = query.neq('user_id', editingUserId);
      }
      const { data: existingUser } = await query.maybeSingle();
      if (existingUser) {
         setErrorMsg("Warning: The username you entered already exists in the system.");
         return;
      }
    }

    try {
      let error;
      let finalUserId = editingUserId;
      if (editingUserId) {
        // @ts-ignore
        const { error: updateError } = await supabase.from('users').update(payload as any).eq('user_id', editingUserId);
        error = updateError;
      } else {
        finalUserId = crypto.randomUUID();
        // @ts-ignore
        const { error: insertError } = await supabase.from('users').insert([{ ...payload, user_id: finalUserId }]);
        error = insertError;
      }
      if (!error) {
        logSystemActivity(
          "Admin Users",
          "/admin/users",
          editingUserId ? `Updated user ${formData.first_name} ${formData.last_name}` : `Created user ${formData.first_name} ${formData.last_name}`,
          editingUserId ? "update" : "create",
          payload
        );
        // Update user roles
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
        setFormData({
          email: '', first_name: '', last_name: '', phone1: '', phone2: '',
          school: '', grade: '', dob: '', user_name: '', address: '',
          emergency_contact: '', medical_condition: '', status: 'Active'
        });
        fetchUsers();
      } else {
        if (error.code === '23505' || error.message?.toLowerCase().includes('duplicate')) {
          showToast("Warning: The data you entered already exists. Please check for duplicates.", "error");
        } else {
          showToast("Error saving user: " + error.message, "error");
        }
      }
    } catch (err: any) {
      showToast("Error: " + err.message, "error");
    }
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

  function handleEdit(user: User) {
    setEditingUserId(user.user_id);
    setFormData({
      email: user.email || '',
      first_name: user.first_name,
      last_name: user.last_name,
      phone1: user.phone1 || '',
      phone2: user.phone2 || '',
      school: user.school || '',
      grade: user.grade || '',
      dob: user.dob || '',
      user_name: user.user_name || '',
      password_hash: user.password_hash || '',
      address: user.address || '',
      emergency_contact: user.emergency_contact || '',
      medical_condition: user.medical_condition || '',
      status: user.status as any,
    });
    const currentRoleIds = userRoles.filter(ur => ur.user_id === user.user_id).map(ur => ur.role_id);
    setSelectedRoleIds(currentRoleIds);
    setShowAdd(true);
  }

  function cancelAdd() {
    setShowAdd(false);
    setEditingUserId(null);
    setSelectedRoleIds([]);
    setFormData({
      email: '', first_name: '', last_name: '', phone1: '', phone2: '',
      school: '', grade: '', dob: '', user_name: '', password_hash: '', address: '',
      emergency_contact: '', medical_condition: '', status: 'Active'
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure?")) return;
    const userToDel = users.find(u => u.user_id === id);
    await supabase.from('users').delete().eq('user_id', id);
    if (userToDel) {
       logSystemActivity(
         "Admin Users",
         "/admin/users",
         `Deleted user ${userToDel.first_name} ${userToDel.last_name}`,
         "delete",
         { user_id: id }
       );
    }
    fetchUsers();
  }

  async function handleAddRoleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    let err = null;
    
    if (editingRoleId) {
      // @ts-ignore
      const { error } = await supabase.from('roles').update({ role_name: roleName }).eq('role_id', editingRoleId);
      err = error;
    } else {
      // @ts-ignore
      const { error } = await supabase.from('roles').insert([{ role_name: roleName }]);
      err = error;
    }

    if (!err) {
      logSystemActivity(
         "Admin Users",
         "/admin/users",
         editingRoleId ? `Updated role to ${roleName}` : `Created role ${roleName}`,
         editingRoleId ? "update" : "create",
         { role_name: roleName }
      );
      setShowAddRole(false);
      setEditingRoleId(null);
      setRoleName("");
      showToast("Role saved successfully.", "success");
      fetchRoles();
    } else {
      if (err.code === '23505' || err.message?.toLowerCase().includes('duplicate')) {
         showToast("Warning: The data you entered already exists. Please check for duplicates.", "error");
      } else {
         showToast(err.message, "error");
      }
    }
  }

  function handleEditRole(role: any) {
    setErrorMsg("");
    setEditingRoleId(role.role_id);
    setRoleName(role.role_name);
    setShowAddRole(true);
  }

  async function handleDeleteRole(id: number) {
    if (!confirm("Are you sure you want to delete this role?")) return;
    setErrorMsg("");
    const { error } = await supabase.from('roles').delete().eq('role_id', id);
    if (error) {
      setErrorMsg(error.message);
    }
    fetchRoles();
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
         showToast("Relationship updated successfully.", "success");
         fetchFamilies();
     } else {
         if (error.code === '23505' || error.message?.toLowerCase().includes('duplicate')) {
            showToast("Warning: This family relationship already exists.", "error");
         } else {
            showToast(error.message, "error");
         }
     }
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
      showToast("Family relationship added.", "success");
      fetchFamilies();
    } else {
      if (error.code === '23505' || error.message?.toLowerCase().includes('duplicate')) {
         showToast("Warning: This family relationship already exists.", "error");
      } else {
         showToast(error.message, "error");
      }
    }
  }

  async function handleDeleteFamily(parentId: string, childId: string) {
    if (!confirm("Are you sure you want to remove this relationship?")) return;
    // @ts-ignore
    await supabase.from('parent_child').delete().eq('parent_id', parentId).eq('child_id', childId);
    fetchFamilies();
  }

  const filteredUsers = users.filter(user => {
    const userRoleMappings = userRoles.filter(ur => ur.user_id === user.user_id);
    
    let matchesSearch = true;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      matchesSearch = 
        (user.first_name && user.first_name.toLowerCase().includes(q)) ||
        (user.last_name && user.last_name.toLowerCase().includes(q)) ||
        (user.user_name && user.user_name.toLowerCase().includes(q)) ||
        (user.email && user.email.toLowerCase().includes(q));
    }
    
    if (!matchesSearch) return false;

    if (filterRole === "All") return true;
    if (filterRole === "Unassigned") return userRoleMappings.length === 0;

    return userRoleMappings.some(ur => {
      const r = roles.find(role => role.role_id === ur.role_id);
      return r && r.role_name.toLowerCase() === filterRole.toLowerCase();
    });
  });

  return (
    <div className="p-6 md:p-8 flex flex-col gap-8 w-full max-w-7xl mx-auto pb-32 md:pb-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h1 className="font-display text-4xl text-primary font-bold tracking-tight">User Management</h1>
           <p className="font-body text-lg text-on-surface-variant mt-2">Manage user directory, roles, and families.</p>
        </div>
        <button 
          onClick={() => {
            if (activeTab === 'users') {
              navigate('/admin/new-user');
            } else if (activeTab === 'roles') {
              setEditingRoleId(null);
              setRoleName("");
              setShowAddRole(!showAddRole);
            } else {
              setShowAddFamily(!showAddFamily);
              setFamParentId('');
              setFamChildId('');
              setFamRelationship('');
            }
          }}
          className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-label font-bold hover:bg-primary/90 transition-colors shadow-sm w-full md:w-auto justify-center"
        >
           <Plus className="w-5 h-5" /> Add {activeTab === 'users' ? 'User' : activeTab === 'roles' ? 'Role' : 'Relationship'}
        </button>
      </header>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
             <Users className="w-6 h-6" />
          </div>
          <div>
             <div className="font-title text-2xl font-bold text-on-surface">{users.length}</div>
             <div className="font-label text-xs uppercase tracking-wider text-on-surface-variant">Total Users</div>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
             <School className="w-6 h-6" />
          </div>
          <div>
             <div className="font-title text-2xl font-bold text-on-surface">{classes.length}</div>
             <div className="font-label text-xs uppercase tracking-wider text-on-surface-variant">Classes</div>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center shrink-0">
             <Shield className="w-6 h-6" />
          </div>
          <div>
             <div className="font-title text-2xl font-bold text-on-surface">{roles.length}</div>
             <div className="font-label text-xs uppercase tracking-wider text-on-surface-variant">Roles</div>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-error-container text-on-error-container flex items-center justify-center shrink-0">
             <Link className="w-6 h-6" />
          </div>
          <div>
             <div className="font-title text-2xl font-bold text-on-surface">{parentChildRelations.length}</div>
             <div className="font-label text-xs uppercase tracking-wider text-on-surface-variant">Families Logged</div>
          </div>
        </div>
      </div>

      <div className="sticky top-[56px] z-30 flex p-1.5 bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl w-full md:w-fit border border-outline-variant/30 shadow-sm overflow-x-auto hide-scrollbar shrink-0">
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2.5 rounded-xl font-label font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'users' ? 'bg-surface shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'}`}
          >
            Directory
          </button>
          <button 
            onClick={() => setActiveTab('roles')}
            className={`px-6 py-2.5 rounded-xl font-label font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'roles' ? 'bg-surface shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'}`}
          >
            Roles & Permissions
          </button>
          <button 
            onClick={() => setActiveTab('families')}
            className={`px-6 py-2.5 rounded-xl font-label font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'families' ? 'bg-surface shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'}`}
          >
            Families
          </button>
          <button 
            onClick={() => {
              setActiveTab('icons');
              setShowAdd(false);
              setShowAddRole(false);
              setShowAddFamily(false);
            }}
            className={`px-6 py-2.5 rounded-xl font-label font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'icons' ? 'bg-surface shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'}`}
          >
            Icon Reference
          </button>
      </div>

      {errorMsg && (
        <div className="bg-orange-100 text-orange-800 border border-orange-200 px-4 py-3 rounded-lg font-body text-sm font-medium">
          {errorMsg}
        </div>
      )}

      {activeTab === 'users' && !showAdd && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar w-full md:w-auto">
              {["All", ...roles.map(r => r.role_name), "Unassigned"].map(rName => {
                  const count = users.filter(user => {
                     const userRoleMappings = userRoles.filter(ur => ur.user_id === user.user_id);
                     if (rName === "All") return true;
                     if (rName === "Unassigned") return userRoleMappings.length === 0;
                     return userRoleMappings.some(ur => {
                       const r = roles.find(role => role.role_id === ur.role_id);
                       return r && r.role_name === rName;
                     });
                  }).length;
                  return (
                 <button
                    key={rName}
                    onClick={() => setFilterRole(rName)}
                    className={`px-4 py-2 rounded-full font-label text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
                      filterRole === rName 
                        ? 'bg-primary text-on-primary' 
                        : 'bg-surface-container-low text-on-surface hover:bg-surface-variant'
                    }`}
                 >
                    {rName}
                    <span className={`text-xs py-0.5 px-2 rounded-full ${filterRole === rName ? 'bg-on-primary/20 text-on-primary' : 'bg-outline-variant/30 text-on-surface-variant'}`}>
                       {count}
                    </span>
                 </button>
                  );
              })}
          </div>
          <div className="relative w-full md:w-72 flex-shrink-0">
             <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
             <input 
               type="text" 
               placeholder="Search users..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant/30 rounded-xl outline-none focus:border-primary text-on-surface transition-colors font-body text-sm shadow-sm"
             />
          </div>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-container-lowest p-6 md:p-8 border-l border-outline-variant/40 shadow-2xl relative overflow-y-auto w-full max-w-2xl h-full transition-transform transform translate-x-0">
           <div className="flex justify-between items-center mb-6">
             <h3 className="font-title text-xl font-bold text-on-surface">{editingUserId ? 'Edit User' : 'Create New User'}</h3>
             <button onClick={() => setShowAdd(false)} className="text-on-surface-variant hover:text-on-surface"><X className="w-6 h-6" /></button>
           </div>
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
                <label className="font-label text-sm font-bold text-on-surface-variant">User Name</label>
                 <div className="flex gap-2">
                   <input type="text" value={formData.user_name} onChange={(e) => setFormData({...formData, user_name: e.target.value})} className="flex-1 px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface" />
                   <button type="button" onClick={generateUsername} disabled={loading} className="px-4 py-3 bg-surface-container hover:bg-surface-container-high border border-outline-variant/50 rounded-xl text-on-surface-variant disabled:opacity-50 transition-colors shrink-0" title="Generate Username">
                     <Wand2 className="w-5 h-5" />
                   </button>
                 </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label text-sm font-bold text-on-surface-variant">Password</label>
                <div className="relative">
                  <input type={showFormPassword ? "text" : "password"} value={formData.password_hash} onChange={(e) => setFormData({...formData, password_hash: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface pr-12" placeholder="Leave blank to drop password" />
                  <button type="button" onClick={() => setShowFormPassword(!showFormPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors focus:outline-none" title={showFormPassword ? "Hide Password" : "Show Password"}>
                    {showFormPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label text-sm font-bold text-on-surface-variant">Date of Birth</label>
                <input type="date" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label text-sm font-bold text-on-surface-variant">Email</label>
                <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface" />
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
                <label className="font-label text-sm font-bold text-on-surface-variant">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as any})} className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface">
                   <option value="Active">Active</option>
                   <option value="Inactive">Inactive</option>
                   <option value="Graduated">Graduated</option>
                   <option value="Left">Left</option>
                </select>
              </div>
              <div className="md:col-span-2 flex flex-col gap-2">
                <label className="font-label text-sm font-bold text-on-surface-variant">Assign Roles</label>
                <div className="flex flex-wrap gap-4 mt-1">
                  {roles.map(role => (
                    <label key={role.role_id} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={selectedRoleIds.includes(role.role_id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRoleIds([...selectedRoleIds, role.role_id]);
                          } else {
                            setSelectedRoleIds(selectedRoleIds.filter(id => id !== role.role_id));
                          }
                        }}
                        className="w-4 h-4 text-primary rounded border-outline-variant"
                      />
                      <span className="font-body text-sm text-on-surface">{role.role_name}</span>
                    </label>
                  ))}
                  {roles.length === 0 && <span className="text-sm font-body text-on-surface-variant italic">No roles defined. Create roles in the Roles tab first.</span>}
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
                 <button type="button" onClick={cancelAdd} className="border border-outline-variant px-8 py-3 rounded-full font-label font-bold text-on-surface-variant hover:bg-surface-variant transition-colors">Cancel</button>
              </div>
           </form>
          </div>
        </div>
      )}

      {activeTab === 'users' && !showAdd && (
         <div className="font-label text-sm text-on-surface-variant font-bold px-1 -mt-2 mb-2">
            Showing {filteredUsers.length} {filterRole === 'All' ? 'total users' : filterRole.toLowerCase() + (filteredUsers.length === 1 ? '' : 's')}
         </div>
      )}
      {activeTab === 'users' && (
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
                 {loading ? (
                   <tr><td colSpan={6} className="p-8 text-center text-on-surface-variant font-body">Loading...</td></tr>
                 ) : filteredUsers.length === 0 ? (
                   <tr><td colSpan={6} className="p-8 text-center text-on-surface-variant font-body">No users found. Create one above!</td></tr>
                 ) : filteredUsers.map(user => (
                   <tr key={user.user_id} className="hover:bg-surface-variant/30 transition-colors">
                     <td className="p-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-title font-bold text-lg">
                              {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                           </div>
                           <div>
                             <p className="font-label text-base font-bold text-on-surface">
                               {user.first_name} {user.last_name}
                             </p>
                             {user.user_name && (
                               <span className="font-caption text-xs text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-sm inline-block mt-1">
                                 @{user.user_name}
                               </span>
                             )}
                           </div>
                        </div>
                     </td>
                     <td className="p-4">
                        <div className="flex flex-col gap-1 font-body text-sm text-on-surface-variant">
                          {user.email && <span className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" />{user.email}</span>}
                          {user.phone1 && <span className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" />{user.phone1}</span>}
                        </div>
                     </td>
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
                           {(() => {
                              const uRoles = userRoles.filter(ur => ur.user_id === user.user_id);
                             if (uRoles.length === 0) return <span className="text-xs font-body text-on-surface-variant opacity-60">No roles</span>;
                             return uRoles.map(ur => {
                               const r = roles.find(role => role.role_id === ur.role_id);
                               return r ? (
                                 <span key={ur.role_id} className="bg-primary/10 text-primary px-2 py-1 rounded-md font-label text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 w-max">
                                   {getRoleIcon(r.role_name, "w-3 h-3")}
                                   {r.role_name}
                                 </span>
                               ) : null;
                             });
                          })()}
                        </div>
                     </td>
                     <td className="p-4">
                        <span className={`px-3 py-1 rounded-full font-label text-xs font-bold ${
                           user.status === 'Active' ? 'bg-tertiary-container/30 text-tertiary' : 
                           user.status === 'Inactive' ? 'bg-error-container/30 text-error' : 
                           'bg-surface-variant text-on-surface-variant'
                        }`}>
                          {user.status}
                        </span>
                     </td>
                     <td className="p-4 text-right">
                        <button onClick={() => handleEdit(user)} className="w-8 h-8 rounded-full inline-flex flex items-center justify-center text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-colors mr-1">
                           <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(user.user_id)} className="w-8 h-8 rounded-full inline-flex flex items-center justify-center text-on-surface-variant hover:bg-error-container hover:text-error transition-colors">
                           <Trash2 className="w-4 h-4" />
                        </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      )}

      {showAddRole && activeTab === 'roles' && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-container-lowest p-6 md:p-8 border-l border-outline-variant/40 shadow-2xl relative overflow-y-auto w-full max-w-md h-full transition-transform transform translate-x-0">
           <div className="flex justify-between items-center mb-6">
             <h3 className="font-title text-xl font-bold text-on-surface">{editingRoleId ? 'Edit Role' : 'Create New Role'}</h3>
             <button onClick={() => setShowAddRole(false)} className="text-on-surface-variant hover:text-on-surface"><X className="w-6 h-6" /></button>
           </div>
           <form onSubmit={handleAddRoleSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-label text-sm font-bold text-on-surface-variant">Role Name</label>
                <input required type="text" value={roleName} onChange={(e) => setRoleName(e.target.value)} className="px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface w-full max-w-md" placeholder="e.g. Teacher" />
              </div>
              <div className="pt-4 flex gap-4">
                 <button type="submit" className="bg-primary text-on-primary px-8 py-3 rounded-full font-label font-bold shadow-sm hover:bg-primary/90 transition-colors">{editingRoleId ? 'Update Role' : 'Save Role'}</button>
                 <button type="button" onClick={() => setShowAddRole(false)} className="border border-outline-variant px-8 py-3 rounded-full font-label font-bold text-on-surface-variant hover:bg-surface-variant transition-colors">Cancel</button>
              </div>
           </form>
          </div>
        </div>
      )}

      {activeTab === 'roles' && !showAddRole && (
         <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl overflow-hidden shadow-sm">
           <div className="overflow-x-auto p-1">
             <table className="w-full text-left border-collapse min-w-[500px]">
               <thead>
                 <tr className="bg-surface-container-low border-b border-outline-variant/30 text-on-surface-variant">
                   <th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Role ID</th>
                   <th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Role Name</th>
                   <th className="p-4 font-label text-xs uppercase tracking-wider font-bold text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-outline-variant/20">
                 {roles.map((role) => (
                   <tr key={role.role_id} className="hover:bg-surface-container-low/50 transition-colors">
                     <td className="p-4">
                        <span className="font-mono text-sm text-on-surface-variant">#{role.role_id}</span>
                     </td>
                     <td className="p-4">
                        <div className="flex items-center gap-2">
                           <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                              {getRoleIcon(role.role_name, "w-4 h-4")}
                           </div>
                           <span className="font-title font-bold text-on-surface">{role.role_name}</span>
                        </div>
                     </td>
                     <td className="p-4 text-right">
                        <button onClick={() => handleEditRole(role)} className="w-8 h-8 rounded-full inline-flex flex items-center justify-center text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-colors mr-1">
                           <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteRole(role.role_id)} className="w-8 h-8 rounded-full inline-flex flex items-center justify-center text-on-surface-variant hover:bg-error-container hover:text-error transition-colors">
                           <Trash2 className="w-4 h-4" />
                        </button>
                     </td>
                   </tr>
                 ))}
                 {roles.length === 0 && (
                   <tr>
                     <td colSpan={3} className="p-8 text-center text-on-surface-variant font-body">
                       No roles defined. Click "Add Role" to create one.
                     </td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>
         </div>
      )}

      {showAddFamily && activeTab === 'families' && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-container-lowest p-6 md:p-8 border-l border-outline-variant/40 shadow-2xl relative overflow-y-auto w-full max-w-4xl h-full transition-transform transform translate-x-0">
           <div className="flex justify-between items-center mb-6">
             <h3 className="font-title text-xl font-bold text-on-surface">Link Parent & Child</h3>
             <button onClick={() => setShowAddFamily(false)} className="text-on-surface-variant hover:text-on-surface"><X className="w-6 h-6" /></button>
           </div>
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
                 <button type="submit" className="bg-primary text-on-primary px-8 py-3 rounded-full font-label font-bold shadow-sm hover:bg-primary/90 transition-colors">Save Relationship</button>
                 <button type="button" onClick={() => setShowAddFamily(false)} className="border border-outline-variant px-8 py-3 rounded-full font-label font-bold text-on-surface-variant hover:bg-surface-variant transition-colors">Cancel</button>
              </div>
           </form>
          </div>
        </div>
      )}

      {activeTab === 'families' && !showAddFamily && (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parentChildRelations.map(rel => {
               const parent = users.find(u => u.user_id === rel.parent_id);
               const child = users.find(u => u.user_id === rel.child_id);
               if (!parent || !child) return null;
               
               const isEditing = editingRelation?.parent_id === rel.parent_id && editingRelation?.child_id === rel.child_id;

               return (
                  <div key={`${rel.parent_id}-${rel.child_id}`} className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 flex items-center justify-between">
                     <div>
                        <div className="font-label text-xs uppercase tracking-wider text-on-surface-variant mb-1 font-bold">Family Link</div>
                        <div className="font-title text-base font-bold text-on-surface flex items-center gap-2 flex-wrap">
                           {parent.first_name} {parent.last_name} 
                           <span className="text-on-surface-variant font-body font-normal">-</span>
                           
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
                           {child.first_name} {child.last_name}
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                         {isEditing ? (
                             <>
                                 <button onClick={() => handleUpdateRelation()} className="w-10 h-10 rounded-full flex items-center justify-center text-primary hover:bg-surface-variant hover:text-primary transition-colors shrink-0">
                                     <Check className="w-4 h-4" />
                                 </button>
                                 <button onClick={() => setEditingRelation(null)} className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-error-container hover:text-error transition-colors shrink-0">
                                     <X className="w-4 h-4" />
                                 </button>
                             </>
                         ) : (
                             <>
                                 <button onClick={() => {
                                     setEditingRelation({parent_id: rel.parent_id, child_id: rel.child_id});
                                     setEditRelType(rel.relationship_type || 'Parent');
                                 }} className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant hover:text-primary transition-colors shrink-0">
                                     <Pencil className="w-4 h-4" />
                                 </button>
                                 <button onClick={() => handleDeleteFamily(rel.parent_id, rel.child_id)} className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-error-container hover:text-error transition-colors shrink-0">
                                     <Trash2 className="w-4 h-4" />
                                 </button>
                             </>
                         )}
                     </div>
                  </div>
               )
            })}
            {parentChildRelations.length === 0 && (
               <div className="col-span-2 p-8 text-center text-on-surface-variant font-body bg-surface-container-lowest rounded-2xl border border-outline-variant/30">
                  No relationships found. Click "Add Relationship" to link users.
               </div>
            )}
         </div>
      )}

      {activeTab === 'icons' && (
         <RoleIconsTab />
      )}

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
