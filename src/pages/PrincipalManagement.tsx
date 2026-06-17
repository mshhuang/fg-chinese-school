import React, { useState } from 'react';
import { Users, School, Megaphone, Settings, Database } from 'lucide-react';
import { cn } from '../lib/utils';
import AdminAcademic from './AdminAcademic';
import AdminContent from './AdminContent';
import AdminDataEntry from './AdminDataEntry';

export default function PrincipalManagement() {
  const [activeTab, setActiveTab] = useState('reference');

  return (
    <div className="flex flex-col w-full h-full">
      <div className="px-6 md:px-8 py-2 bg-surface/80 border-b border-outline-variant/30 select-none overflow-x-auto overflow-y-hidden hide-scrollbar">
        <div className="flex gap-2 max-w-7xl mx-auto min-w-max">
          {[
            { id: 'reference', label: 'Directory & Reference', icon: Database },
            { id: 'academic', label: 'Academic Setup', icon: School },
            { id: 'content', label: 'Content Management', icon: Megaphone }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-full font-label font-bold text-sm transition-all duration-200",
                activeTab === tab.id
                  ? "bg-primary-container text-on-primary-container"
                  : "text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 relative w-full h-full">
        {activeTab === 'academic' && <AdminAcademic />}
        {activeTab === 'content' && <AdminContent />}
        {activeTab === 'reference' && <AdminDataEntry />}
      </div>
    </div>
  );
}
