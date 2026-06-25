import React, { useState, useEffect } from "react";
import { Building, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function StaffAvailability() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    const { data, error } = await supabase.from('rooms').select('*').order('room_number');
    if (!error && data) {
       const formattedRooms = data.map(r => ({
          room: `Room ${r.room_number}${r.building ? ` (${r.building})` : ''}`,
          status: "Free",
          time: "Available",
          type: "secondary"
       }));
       setRooms(formattedRooms);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto w-full">
      <h1 className="font-display text-4xl text-on-surface font-bold tracking-tight mb-2">Classroom Availability</h1>
      <p className="font-body text-on-surface-variant max-w-2xl text-lg mb-8">
        Check real-time status of classrooms and facilities.
      </p>

      <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/30 shadow-[0_8px_30px_rgba(212,175,55,0.05)]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h2 className="font-title text-2xl text-on-surface font-bold flex items-center gap-3">
             <Building className="text-secondary w-6 h-6" /> 
             Facility Status
          </h2>
          <div className="flex items-center gap-4 bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/30 font-body text-sm">
             <span className="flex items-center gap-1.5 font-bold"><div className="w-2.5 h-2.5 rounded-full bg-secondary"></div> Free</span>
             <span className="flex items-center gap-1.5 font-bold"><div className="w-2.5 h-2.5 rounded-full bg-error"></div> In Use</span>
             <span className="flex items-center gap-1.5 font-bold"><div className="w-2.5 h-2.5 rounded-full bg-outline"></div> Maintenance</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
             <div className="col-span-full py-8 text-center text-on-surface-variant flex justify-center items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Loading facilities...
             </div>
          ) : rooms.length === 0 ? (
             <div className="col-span-full py-8 text-center text-on-surface-variant">
                No facilities found.
             </div>
          ) : rooms.map((room, idx) => (
            <div key={idx} className="flex flex-col p-5 bg-surface-container-low rounded-2xl border border-outline-variant/20 hover:border-primary-container transition-colors">
              <div className="flex justify-between items-start mb-3">
                 <span className="font-title font-bold text-on-surface text-lg">{room.room}</span>
                 <div className={`w-3 h-3 rounded-full mt-1.5 ${
                    room.type === 'secondary' ? 'bg-secondary' : 
                    room.type === 'error' ? 'bg-error' : 'bg-outline'
                 }`}></div>
              </div>
              <span className="font-body text-sm text-on-surface-variant mb-1 font-medium">{room.status}</span>
              <span className="font-caption text-xs text-outline font-bold uppercase tracking-wider">{room.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
