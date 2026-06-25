import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Megaphone, Plus, Trash2, Newspaper } from "lucide-react";

export default function AdminContent() {
  const [activeTab, setActiveTab] = useState<'announcements' | 'newsletters'>('announcements');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [confirmId, setConfirmId] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  async function fetchData() {
    setLoading(true);
    let table = activeTab;
    const { data: res, error } = await supabase.from(table).select('*').order(table === 'announcements' ? 'announcement_id' : 'newsletter_id', { ascending: false });
    if (res) setData(res);
    setLoading(false);
  }

  async function handleDelete(id: any, confirmed: boolean = false) {
    if (!confirmed) return;
    const idField = activeTab === 'announcements' ? 'announcement_id' : 'newsletter_id';
    await supabase.from(activeTab).delete().eq(idField, id);
    setConfirmId(null);
    fetchData();
  }

  return (
    <div className="p-6 md:p-8 flex flex-col gap-8 w-full max-w-7xl mx-auto pb-32 md:pb-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h1 className="font-display text-4xl text-primary font-bold tracking-tight">Content Management</h1>
           <p className="font-body text-lg text-on-surface-variant mt-2">Manage global announcements and newsletters directly via database.</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-label font-bold hover:bg-primary/90 transition-colors shadow-sm w-full md:w-auto justify-center"
        >
           <Plus className="w-5 h-5" /> Add {activeTab === 'announcements' ? 'Announcement' : 'Newsletter'}
        </button>
      </header>

      <div className="sticky top-[56px] z-30 flex p-1.5 bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl w-full md:w-fit border border-outline-variant/30 shadow-sm overflow-x-auto hide-scrollbar shrink-0">
          <button 
            onClick={() => setActiveTab('announcements')}
            className={`px-6 py-2.5 rounded-xl font-label font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'announcements' ? 'bg-surface shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'}`}
          >
            Announcements
          </button>
          <button 
            onClick={() => setActiveTab('newsletters')}
            className={`px-6 py-2.5 rounded-xl font-label font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'newsletters' ? 'bg-surface shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'}`}
          >
            Newsletters
          </button>
      </div>

      {showAdd && (
        <div className="flex flex-col items-center justify-center p-8 bg-surface-container-low border border-dashed border-outline-variant/40 rounded-3xl text-center">
            <h3 className="font-title text-xl text-on-surface font-bold">New Form Under Construction</h3>
            <p className="font-body text-on-surface-variant mt-2 max-w-md">The submission form is mocked up in the Principal views. Data binding requires teacher auth relation.</p>
            <button onClick={() => setShowAdd(false)} className="mt-6 border border-outline-variant px-6 py-2 rounded-full font-label text-sm text-on-surface-variant">Close</button>
        </div>
      )}

      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl overflow-hidden shadow-sm">
           <div className="overflow-x-auto p-1">
             <table className="w-full text-left border-collapse min-w-[700px]">
               <thead>
                 <tr className="bg-surface-container-low border-b border-outline-variant/30 text-on-surface-variant">
                   <th className="p-4 font-label text-xs uppercase tracking-wider font-bold">ID</th>
                   <th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Title</th>
                   <th className="p-4 font-label text-xs uppercase tracking-wider font-bold">Context Preview</th>
                   <th className="p-4 font-label text-xs uppercase tracking-wider font-bold text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-outline-variant/20">
                 {loading ? (
                   <tr><td colSpan={4} className="p-8 text-center text-on-surface-variant font-body">Loading...</td></tr>
                 ) : data.length === 0 ? (
                   <tr><td colSpan={4} className="p-8 text-center text-on-surface-variant font-body">No records found.</td></tr>
                 ) : data.map((row: any) => (
                   <tr key={row.announcement_id || row.newsletter_id} className="hover:bg-surface-variant/30 transition-colors">
                     <td className="p-4 font-body text-sm text-on-surface-variant">
                        #{row.announcement_id || row.newsletter_id}
                     </td>
                     <td className="p-4">
                        <div className="flex items-center gap-3">
                           {activeTab === 'announcements' ? <Megaphone className="w-5 h-5 text-secondary" /> : <Newspaper className="w-5 h-5 text-tertiary" />}
                           <span className="font-label text-base font-bold text-on-surface">
                              {row.title}
                           </span>
                        </div>
                     </td>
                     <td className="p-4">
                        <p className="font-body text-sm text-on-surface-variant max-w-sm truncate">
                           {row.content}
                        </p>
                     </td>
                     <td className="p-4 text-right">
                        {confirmId === (row.announcement_id || row.newsletter_id) ? (
                            <div className="flex items-center justify-end gap-2">
                                <button onClick={() => setConfirmId(null)} className="text-xs font-bold text-on-surface-variant hover:text-on-surface px-2 py-1">Cancel</button>
                                <button onClick={() => handleDelete(row.announcement_id || row.newsletter_id, true)} className="text-xs font-bold text-error bg-error-container/20 px-3 py-1 rounded-full hover:bg-error-container">Delete</button>
                            </div>
                        ) : (
                            <button onClick={() => setConfirmId(row.announcement_id || row.newsletter_id)} className="w-8 h-8 rounded-full inline-flex flex items-center justify-center text-on-surface-variant hover:bg-error-container hover:text-error transition-colors">
                               <Trash2 className="w-4 h-4" />
                            </button>
                        )}
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
