import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, Phone, MapPin, Edit3, HeartPulse, Save, X, CheckCircle2, AlertCircle, Loader2, KeyRound } from "lucide-react";
import { supabase } from "../lib/supabase";
import { cn } from "../lib/utils";

const toProperCase = (str: string) => {
  if (!str) return '';
  return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: "success" | "error", text: string} | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          if (u.id === 'demo') {
            const demoData = {
              first_name: u.first_name || 'Demo',
              last_name: u.last_name || 'User',
              email: 'demo@example.com',
              user_name: 'demo_user',
              dob: '1990-01-01',
              school: 'Demo High School',
              grade: '10',
              phone1: '555-0123',
              address: '123 Demo St',
            };
            setProfile(demoData);
            setFormData(demoData);
            return;
          }
          const { data } = await supabase.from('users').select('*').eq('user_id', u.id).single();
          if (data) {
            setProfile(data);
            setFormData(data);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (formData.email && formData.email.indexOf('@') === -1) {
      setMessage({ type: "error", text: "Please enter a valid email containing '@'." });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) throw new Error("Not logged in");
      const u = JSON.parse(userStr);

      const properFirstName = toProperCase(formData.first_name);
      const properLastName = toProperCase(formData.last_name);

      if (u.id === 'demo') {
        const newData = { ...profile, ...formData, first_name: properFirstName, last_name: properLastName };
        setProfile(newData);
        setMessage({ type: "success", text: "Profile updated successfully (Demo Mode)." });
        setIsEditing(false);
        setLoading(false);
        return;
      }

      // @ts-ignore
      const { data, error } = await supabase.from('users').update({
        first_name: properFirstName,
        last_name: properLastName,
        email: formData.email,
        dob: formData.dob,
        school: formData.school,
        grade: formData.grade,
        phone1: formData.phone1,
        phone2: formData.phone2,
        address: formData.address,
        emergency_contact: formData.emergency_contact,
        medical_condition: formData.medical_condition
      }).eq('user_id', u.id).select().single();

      if (error) throw error;
      
      setProfile(data);
      setIsEditing(false);
      setMessage({ type: "success", text: "Profile updated successfully." });
      
      setTimeout(() => setMessage(null), 3000);
    } catch (e: any) {
      console.error(e);
      setMessage({ type: "error", text: e.message || "Failed to update profile." });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const cancelEdit = () => {
    setFormData(profile);
    setIsEditing(false);
    setMessage(null);
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 w-full pb-32 md:pb-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="font-display text-4xl text-primary font-bold tracking-tight mb-2">My Information</h1>
          <p className="font-body text-lg text-on-surface-variant">View and edit your personal details and contact information.</p>
        </div>
        {!isEditing ? (
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary font-label text-sm font-bold rounded-full hover:bg-primary/90 transition-colors shadow-sm shrink-0"
            >
              <Edit3 className="w-4 h-4" /> Edit Profile
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={cancelEdit}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-surface text-on-surface hover:bg-surface-variant font-label text-sm font-bold rounded-full border border-outline-variant/40 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary font-label text-sm font-bold rounded-full hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
              Save Changes
            </button>
          </div>
        )}
      </header>

      {message && (
        <div className={cn(
          "p-4 rounded-xl flex items-center gap-3 font-body text-sm font-bold animate-in fade-in duration-300",
          message.type === 'success' ? "bg-green-100 text-green-800 border border-green-200" : "bg-orange-100 text-orange-800 border border-orange-200"
        )}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <div className={cn("bg-surface-container-lowest p-8 rounded-3xl border shadow-sm relative overflow-hidden transition-colors", isEditing ? "border-primary/40 ring-1 ring-primary/20" : "border-outline-variant/40")}>
        <h2 className="font-title text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
           <User className="w-5 h-5 text-primary" /> Personal Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
              <p className="font-label text-xs uppercase tracking-wider text-on-surface-variant mb-2 font-bold">First Name</p>
              {isEditing ? (
                 <input type="text" name="first_name" value={formData.first_name || ''} onChange={handleChange} className="w-full px-4 py-2.5 bg-surface rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body text-base" />
              ) : (
                 <p className="font-body text-on-surface text-lg">{profile.first_name || '-'}</p>
              )}
           </div>
           <div>
              <p className="font-label text-xs uppercase tracking-wider text-on-surface-variant mb-2 font-bold">Last Name</p>
              {isEditing ? (
                 <input type="text" name="last_name" value={formData.last_name || ''} onChange={handleChange} className="w-full px-4 py-2.5 bg-surface rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body text-base" />
              ) : (
                 <p className="font-body text-on-surface text-lg">{profile.last_name || '-'}</p>
              )}
           </div>
           <div>
              <p className="font-label text-xs uppercase tracking-wider text-on-surface-variant mb-2 font-bold">Email</p>
              {isEditing ? (
                 <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="w-full px-4 py-2.5 bg-surface rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body text-base" />
              ) : (
                 <p className="font-body text-on-surface text-lg">{profile.email || '-'}</p>
              )}
           </div>
           <div>
              <p className="font-label text-xs uppercase tracking-wider text-on-surface-variant mb-2 font-bold">Username</p>
              <p className="font-body text-on-surface-variant text-lg bg-surface-variant/30 px-4 py-2 rounded-xl inline-block border border-outline-variant/20">{profile.user_name || '-'}</p>
           </div>
           <div>
              <p className="font-label text-xs uppercase tracking-wider text-on-surface-variant mb-2 font-bold">Date of Birth</p>
              {isEditing ? (
                 <input type="date" name="dob" value={formData.dob || ''} onChange={handleChange} className="w-full px-4 py-2.5 bg-surface rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body text-base" />
              ) : (
                 <p className="font-body text-on-surface text-lg">{profile.dob || '-'}</p>
              )}
           </div>
           <div>
              <p className="font-label text-xs uppercase tracking-wider text-on-surface-variant mb-2 font-bold">School</p>
              {isEditing ? (
                 <input type="text" name="school" value={formData.school || ''} onChange={handleChange} className="w-full px-4 py-2.5 bg-surface rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body text-base" />
              ) : (
                 <p className="font-body text-on-surface text-lg">{profile.school || '-'}</p>
              )}
           </div>
           <div>
              <p className="font-label text-xs uppercase tracking-wider text-on-surface-variant mb-2 font-bold">Grade</p>
              {isEditing ? (
                 <input type="text" name="grade" value={formData.grade || ''} onChange={handleChange} className="w-full px-4 py-2.5 bg-surface rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body text-base" />
              ) : (
                 <p className="font-body text-on-surface text-lg">{profile.grade || '-'}</p>
              )}
           </div>
        </div>
      </div>

      <div className={cn("bg-surface-container-lowest p-8 rounded-3xl border shadow-sm relative overflow-hidden transition-colors", isEditing ? "border-primary/40 ring-1 ring-primary/20" : "border-outline-variant/40")}>
        <h2 className="font-title text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
           <Phone className="w-5 h-5 text-primary" /> Contact Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
              <p className="font-label text-xs uppercase tracking-wider text-on-surface-variant mb-2 font-bold">Primary Phone</p>
              {isEditing ? (
                 <input type="text" name="phone1" value={formData.phone1 || ''} onChange={handleChange} className="w-full px-4 py-2.5 bg-surface rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body text-base" />
              ) : (
                 <p className="font-body text-on-surface text-lg">{profile.phone1 || '-'}</p>
              )}
           </div>
           <div>
              <p className="font-label text-xs uppercase tracking-wider text-on-surface-variant mb-2 font-bold">Secondary Phone</p>
              {isEditing ? (
                 <input type="text" name="phone2" value={formData.phone2 || ''} onChange={handleChange} className="w-full px-4 py-2.5 bg-surface rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body text-base" />
              ) : (
                 <p className="font-body text-on-surface text-lg">{profile.phone2 || '-'}</p>
              )}
           </div>
           <div className="md:col-span-2">
              <p className="font-label text-xs uppercase tracking-wider text-on-surface-variant mb-2 font-bold">Address</p>
              {isEditing ? (
                 <textarea name="address" value={formData.address || ''} onChange={handleChange} rows={2} className="w-full px-4 py-2.5 bg-surface rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body text-base"></textarea>
              ) : (
                 <p className="font-body text-on-surface text-lg">{profile.address || '-'}</p>
              )}
           </div>
        </div>
      </div>

      <div className={cn("bg-surface-container-lowest p-8 rounded-3xl border shadow-sm relative overflow-hidden transition-colors", isEditing ? "border-primary/40 ring-1 ring-primary/20" : "border-outline-variant/40")}>
        <h2 className="font-title text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
           <HeartPulse className="w-5 h-5 text-error" /> Health & Emergency
        </h2>
        <div className="grid grid-cols-1 gap-6">
           <div>
              <p className="font-label text-xs uppercase tracking-wider text-on-surface-variant mb-2 font-bold">Emergency Contact</p>
              {isEditing ? (
                 <input type="text" name="emergency_contact" value={formData.emergency_contact || ''} onChange={handleChange} placeholder="Name & Phone" className="w-full px-4 py-2.5 bg-surface rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body text-base" />
              ) : (
                 <p className="font-body text-on-surface text-lg">{profile.emergency_contact || 'None specified'}</p>
              )}
           </div>
           <div>
              <p className="font-label text-xs uppercase tracking-wider text-on-surface-variant mb-2 font-bold">Medical Conditions / Allergies</p>
              {isEditing ? (
                 <textarea name="medical_condition" value={formData.medical_condition || ''} onChange={handleChange} rows={3} placeholder="List any medical conditions or allergies..." className="w-full px-4 py-2.5 bg-surface rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body text-base"></textarea>
              ) : (
                 <p className="font-body text-on-surface text-lg">{profile.medical_condition || 'None specified'}</p>
              )}
           </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/40 shadow-sm relative overflow-hidden transition-colors">
        <h2 className="font-title text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
           <KeyRound className="w-5 h-5 text-primary" /> Account Security
        </h2>
        <div className="flex flex-col gap-4">
           <p className="font-body text-on-surface-variant text-base">Keep your account secure by updating your password regularly.</p>
           <Link to="/change-password" className="px-6 py-2.5 bg-surface-container hover:bg-surface-container-high border border-outline-variant/50 text-on-surface-variant hover:text-on-surface font-label font-bold rounded-full transition-colors flex items-center gap-2 w-fit">
              <KeyRound className="w-4 h-4" /> Change Password
           </Link>
        </div>
      </div>
    </div>
  );
}
