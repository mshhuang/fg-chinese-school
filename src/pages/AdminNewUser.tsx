import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../lib/database.types';
import { UserPlus, Save, AlertCircle, ArrowLeft, Wand2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminNewUser = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [roles, setRoles] = useState<{ role_id: number; role_name: string }[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | ''>('');
  
  const [users, setUsers] = useState<{ user_id: string; first_name: string; last_name: string }[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [relationship, setRelationship] = useState<string>('');

  useEffect(() => {
    async function fetchData() {
      const { data: roleData } = await supabase.from('roles').select('*').order('role_name');
      if (roleData) setRoles((roleData as any[]));
      
      const { data: userData } = await supabase.from('users').select('user_id, first_name, last_name').order('first_name');
      if (userData) setUsers(userData);
    }
    fetchData();
  }, []);

  const [formData, setFormData] = useState<Omit<User, 'user_id' | 'created_at'>>({
    email: '',
    password_hash: '',
    first_name: '',
    last_name: '',
    phone1: '',
    phone2: '',
    school: '',
    grade: '',
    dob: '',
    user_name: '',
    address: '',
    emergency_contact: '',
    medical_condition: '',
    status: 'Active',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    let value = e.target.value;
    if (e.target.name === 'phone1' || e.target.name === 'phone2') {
      const val = value.replace(/\D/g, '');
      value = val;
      if (val.length > 0 && val.length < 4) {
        value = `(${val}`;
      } else if (val.length >= 4 && val.length <= 6) {
        value = `(${val.slice(0,3)}) ${val.slice(3)}`;
      } else if (val.length >= 7) {
        value = `(${val.slice(0,3)}) ${val.slice(3,6)}-${val.slice(6,10)}`;
      }
    }
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const generateUsername = async () => {
    if (!formData.first_name || !formData.last_name) {
      setErrorMsg("Please enter First Name and Last Name to generate a username.");
      return;
    }

    const baseName = (formData.first_name.charAt(0) + formData.last_name).toLowerCase().replace(/[^a-z0-9]/g, '');
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setErrorMsg("");

    const insertData = { ...formData };
    
    // clean up empty strings to be null for optional fields to avoid type errors if necessary, though text fields are fine as empty strings. Let's just pass empty strings as that's what input defaults to, unless it becomes an issue.
    // Replace empty strings with null where appropriate if needed by Supabase
    const finalUserId = crypto.randomUUID();
    const payload: User = Object.fromEntries(
      Object.entries(insertData).map(([k, v]) => [k, v === '' ? null : v])
    ) as any;
    
    if (payload.user_name) {
      const { data: existingUser } = await supabase.from('users').select('user_id').eq('user_name', payload.user_name).maybeSingle();
      if (existingUser) {
         setErrorMsg("Warning: The username you entered already exists in the system.");
         return;
      }
    }

    payload.user_id = finalUserId; // explicitly assign primary key

    const { error } = await (supabase as any)
      .from('users')
      .insert([payload]);

    if (error) {
      if (error.code === '23505' || error.message?.toLowerCase().includes('duplicate')) {
         window.alert("Warning: The user data you entered already exists. Please check for duplicate email or username.");
      } else {
         setErrorMsg(error.message);
      }
    } else {
      let linkedErrorMsg = "";
      
      if (selectedRoleId !== '') {
        const { error: roleError } = await (supabase as any)
          .from('user_roles')
          .insert([{ user_id: finalUserId, role_id: Number(selectedRoleId) }]);
        
        if (roleError) {
          linkedErrorMsg += roleError.message + " ";
        }
      }

      if (selectedChildId !== '') {
        const { error: parentChildError } = await (supabase as any)
          .from('parent_child')
          // Assume the table was modified to accept 'relationship_type', passing it via any
          .insert([{ parent_id: finalUserId, child_id: selectedChildId, relationship_type: relationship }]);

        if (parentChildError) {
          linkedErrorMsg += parentChildError.message + " ";
        }
      }

      if (linkedErrorMsg.trim()) {
        setErrorMsg("User created, but encountered errors linking: " + linkedErrorMsg);
      } else {
        setSuccess(true);
        setFormData({
          email: '',
          password_hash: '',
          first_name: '',
          last_name: '',
          phone1: '',
          phone2: '',
          school: '',
          grade: '',
          dob: '',
          user_name: '',
          address: '',
          emergency_contact: '',
          medical_condition: '',
          status: 'Active',
        });
        setSelectedRoleId('');
        setSelectedChildId('');
        setRelationship('');
      }
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center mb-8">
        <button onClick={() => navigate(-1)} className="mr-4 p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="font-display tracking-tight text-3xl text-slate-900 border-b-2 border-slate-900 inline-block pb-1">
            Create New User
          </h1>
          <p className="text-slate-500 mt-2">Enter the details for a new user in the system.</p>
        </div>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center animate-in fade-in">
          <Save className="w-5 h-5 mr-2" />
          User created successfully!
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 text-orange-800 rounded-lg flex items-center animate-in fade-in">
          <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium text-slate-900 border-b pb-2">Basic Info</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
              <input required type="text" name="first_name" value={formData.first_name || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
              <input required type="text" name="last_name" value={formData.last_name || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
              <input type="date" name="dob" value={formData.dob || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border rounded-md bg-white">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Graduated">Graduated</option>
                <option value="Left">Left</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-slate-900 border-b pb-2">Account Details</h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
              <select name="role" value={selectedRoleId} onChange={(e) => setSelectedRoleId(e.target.value ? Number(e.target.value) : '')} className="w-full px-3 py-2 border rounded-md bg-white">
                <option value="">No Role Assigned</option>
                {roles.map(r => (
                  <option key={r.role_id} value={r.role_id}>{r.role_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <div className="flex gap-2">
                <input type="text" name="user_name" value={formData.user_name || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
                <button type="button" onClick={generateUsername} disabled={loading} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border rounded-md text-slate-700 disabled:opacity-50 transition-colors" title="Generate Username">
                  <Wand2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input type="password" name="password_hash" value={formData.password_hash || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" placeholder="Enter password hash/raw password" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-slate-900 border-b pb-2">Contact Info</h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Primary Phone *</label>
              <input required type="tel" name="phone1" value={formData.phone1 || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" placeholder="(212) 123-4567" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Secondary Phone</label>
              <input type="tel" name="phone2" value={formData.phone2 || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" placeholder="(212) 123-4567" />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
              <textarea name="address" value={formData.address || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" rows={2}></textarea>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Contact</label>
              <input type="text" name="emergency_contact" value={formData.emergency_contact || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Link Child User</label>
              <select value={selectedChildId} onChange={(e) => setSelectedChildId(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white">
                <option value="">No child linked</option>
                {users.map(u => (
                  <option key={u.user_id} value={u.user_id}>{u.first_name} {u.last_name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Relationship to Child</label>
              <input type="text" value={relationship} onChange={(e) => setRelationship(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="e.g. Mother, Father, Guardian" />
            </div>
          </div>

          {selectedRoleId !== '' && roles.find(r => r.role_id === selectedRoleId)?.role_name.toLowerCase() === 'student' && (
            <div className="space-y-4 md:col-span-2">
              <h3 className="font-medium text-slate-900 border-b pb-2">Academic & Health</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">School</label>
                  <input type="text" name="school" value={formData.school || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Grade</label>
                  <input type="text" name="grade" value={formData.grade || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Medical Condition</label>
                  <textarea name="medical_condition" value={formData.medical_condition || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" rows={2}></textarea>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminNewUser;
