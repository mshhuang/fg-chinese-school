import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { BuilderIconCustom, AdminIconCustom, StaffIconCustom, VolunteerIconCustom, TeacherIconCustom, StudentIconCustom } from "../icons";
import { Home, User as UserIcon, Edit2 } from "lucide-react";

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

export default function RoleIconsTab() {
  const [roles, setRoles] = useState<any[]>([]);

  useEffect(() => {
    const fetchRoles = async () => {
      const { data } = await supabase.from('roles').select('*');
      if (data) {
        setRoles(data);
      }
    };
    fetchRoles();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center bg-surface-container-low p-6 rounded-3xl border border-outline-variant/30">
         <div>
            <h2 className="font-display text-2xl font-bold text-on-surface">Role Icons Reference</h2>
            <p className="font-body text-on-surface-variant mt-1">Reference guide for role-specific icons used across the system.</p>
         </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl overflow-hidden shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map(role => (
            <div key={role.role_id} className="flex items-center justify-between bg-surface-container-low p-4 rounded-xl border border-outline-variant/20 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      {getRoleIcon(role.role_name, "w-6 h-6")}
                  </div>
                  <div>
                      <h3 className="font-title font-bold text-on-surface uppercase tracking-wide">{role.role_name}</h3>
                      <p className="font-body text-xs text-on-surface-variant">ID: #{role.role_id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => alert('Icon customization coming soon!')}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-colors"
                  title="Change Icon"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
            </div>
        ))}
        {roles.length === 0 && (
           <div className="col-span-full text-center text-on-surface-variant font-body">
               Loading roles...
           </div>
        )}
      </div>
    </div>
  );
}
