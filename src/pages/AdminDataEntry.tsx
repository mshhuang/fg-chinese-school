import React, { useState } from "react";
import UserDirectoryTab from "../components/admin/UserDirectoryTab";
import FamilyTab from "../components/admin/FamilyTab";
import RoleIconsTab from "../components/admin/RoleIconsTab";

export default function AdminDataEntry() {
  const [activeTab, setActiveTab] = useState<'users'|'families'|'icons'>('users');

  return (
    <div className="p-6 md:p-8 flex flex-col gap-8 w-full max-w-7xl mx-auto pb-32 md:pb-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h1 className="font-display text-4xl text-primary font-bold tracking-tight">Directory</h1>
           <p className="font-body text-lg text-on-surface-variant mt-2">Manage system accounts and families.</p>
        </div>
      </header>

      <div className="flex gap-4 border-b border-outline-variant/30 overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setActiveTab('users')}
            className={`pb-4 px-2 font-label font-bold text-sm whitespace-nowrap transition-all border-b-2 ${activeTab === 'users' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'}`}
          >
            Directory
          </button>
          <button 
            onClick={() => setActiveTab('families')}
            className={`pb-4 px-2 font-label font-bold text-sm whitespace-nowrap transition-all border-b-2 ${activeTab === 'families' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'}`}
          >
            Families
          </button>
          <button 
            onClick={() => setActiveTab('icons')}
            className={`pb-4 px-2 font-label font-bold text-sm whitespace-nowrap transition-all border-b-2 ${activeTab === 'icons' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'}`}
          >
            Icon Reference
          </button>
      </div>

      {activeTab === 'users' && <UserDirectoryTab />}
      {activeTab === 'families' && <FamilyTab />}
      {activeTab === 'icons' && <RoleIconsTab />}
    </div>
  );
}
