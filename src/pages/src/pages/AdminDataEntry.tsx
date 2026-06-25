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

      <div className="sticky top-[56px] z-30 flex p-1.5 bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl w-full md:w-fit border border-outline-variant/30 shadow-sm overflow-x-auto hide-scrollbar shrink-0">
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2.5 rounded-xl font-label font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'users' ? 'bg-surface shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'}`}
          >
            Directory
          </button>
          <button 
            onClick={() => setActiveTab('families')}
            className={`px-6 py-2.5 rounded-xl font-label font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'families' ? 'bg-surface shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'}`}
          >
            Families
          </button>
          <button 
            onClick={() => setActiveTab('icons')}
            className={`px-6 py-2.5 rounded-xl font-label font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'icons' ? 'bg-surface shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'}`}
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
