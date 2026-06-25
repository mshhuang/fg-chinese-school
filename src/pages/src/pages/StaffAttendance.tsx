import React, { useState, useEffect } from "react";
import { ClipboardEdit, Search, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function StaffAttendance() {
  const [searchQuery, setSearchQuery] = useState("");
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    const { data, error } = await supabase.from('classes').select('*').order('class_name');
    if (!error && data) {
      setClasses(data);
    }
    setLoading(false);
  };
  
  const filteredClasses = classes.filter(c => c.class_name?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto w-full">
      <h1 className="font-display text-4xl text-on-surface font-bold tracking-tight mb-2">Attendance & Reports</h1>
      <p className="font-body text-on-surface-variant max-w-2xl text-lg mb-8">
        Submit the student headcount by class for today's sessions.
      </p>

      <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/30 shadow-[0_8px_30px_rgba(212,175,55,0.05)]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="font-title text-2xl text-on-surface font-bold flex items-center gap-3">
             <ClipboardEdit className="text-secondary w-6 h-6" /> 
             Daily Attendance Report
          </h2>
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="Search class..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface-container rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body text-sm"
            />
          </div>
        </div>
        
        <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/20">
           <div className="overflow-x-auto mb-6">
             <table className="w-full text-left border-collapse min-w-[400px]">
               <thead>
                 <tr className="border-b border-outline-variant/30">
                   <th className="pb-3 font-label text-xs font-bold text-on-surface uppercase tracking-wider w-1/3">Class</th>
                   <th className="pb-3 font-label text-xs font-bold text-on-surface uppercase tracking-wider">Present</th>
                   <th className="pb-3 font-label text-xs font-bold text-on-surface uppercase tracking-wider">Absent</th>
                 </tr>
               </thead>
               <tbody>
                 {loading ? (
                    <tr><td colSpan={3} className="py-8 text-center text-on-surface-variant flex justify-center items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Loading classes...</td></tr>
                 ) : filteredClasses.length === 0 ? (
                    <tr><td colSpan={3} className="py-8 text-center text-on-surface-variant">No classes found.</td></tr>
                 ) : filteredClasses.map((cls) => (
                   <tr key={cls.class_id} className="border-b border-outline-variant/10 last:border-0 hover:bg-surface-variant/20 transition-colors">
                     <td className="py-4 font-title text-sm text-on-surface font-bold">
                       <div className="flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full bg-secondary`}></div>
                         {cls.class_name}
                       </div>
                     </td>
                     <td className="py-4 pr-4">
                        <input type="number" min="0" placeholder="0" className="w-full min-w-[70px] max-w-[120px] px-3 py-2 rounded-lg border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body text-sm bg-surface text-on-surface" />
                     </td>
                     <td className="py-4">
                        <input type="number" min="0" placeholder="0" className="w-full min-w-[70px] max-w-[120px] px-3 py-2 rounded-lg border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body text-sm bg-surface text-on-surface" />
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
           
           <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20">
             <button className="px-6 py-3 rounded-xl border border-outline-variant/50 font-label text-sm font-bold text-on-surface-variant hover:bg-surface-variant transition-colors">
                Save Draft
             </button>
             <button className="bg-primary text-on-primary px-6 py-3 rounded-xl font-label text-sm font-bold shadow-sm hover:bg-primary/90 transition-colors">
                Submit Report
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}
