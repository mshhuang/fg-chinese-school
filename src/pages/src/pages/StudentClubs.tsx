import { useState } from "react";
import { Users, Search, PlusCircle, Calendar, Star, ChevronRight } from "lucide-react";
import { cn } from "../lib/utils";

const CLUBS = [
  {
    id: 1,
    name: "Calligraphy Club",
    description: "Learn and practice traditional Chinese calligraphy.",
    schedule: "Wednesdays, 3:30 PM",
    room: "Art Room",
    status: "joined",
    tags: ["Arts", "Cultural"]
  },
  {
    id: 2,
    name: "Debate Team",
    description: "Compete in local and regional debate tournaments.",
    schedule: "Thursdays, 4:00 PM",
    room: "Room 102",
    status: "available",
    tags: ["Academic", "Competitive"]
  },
  {
    id: 3,
    name: "Martial Arts",
    description: "Basic self-defense and traditional forms.",
    schedule: "Tuesdays & Fridays, 4:00 PM",
    room: "Gym",
    status: "available",
    tags: ["Sports", "Physical"]
  }
];

export default function StudentClubs() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClubs = CLUBS.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="w-full max-w-[1600px] mx-auto p-6 md:p-8 flex flex-col gap-8 pb-32 md:pb-8">
       {/* Header */}
       <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div>
           <h1 className="font-display text-4xl text-primary font-bold tracking-tight">Clubs & Activities</h1>
           <p className="font-body text-lg text-on-surface-variant mt-2">Explore extracurricular activities, sign up for after-school clubs, and view your club schedule.</p>
         </div>
       </header>

       {/* Toolbar */}
       <div className="flex flex-col xl:flex-row justify-between gap-6">
          <div className="flex items-center gap-3 bg-surface-container-low rounded-full px-4 py-2 border border-outline-variant/40 shrink-0 w-full xl:w-80 shadow-sm focus-within:border-primary/50 transition-colors">
             <Search className="w-5 h-5 text-on-surface-variant" />
             <input 
               type="text" 
               placeholder="Search clubs or tags..." 
               className="bg-transparent border-none outline-none font-body text-sm w-full"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
          </div>
       </div>

       {/* Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map(club => (
             <div key={club.id} className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 flex flex-col hover:shadow-md transition-shadow relative">
                {club.status === "joined" && (
                   <div className="absolute top-6 right-6 bg-primary text-on-primary w-8 h-8 rounded-full flex items-center justify-center shadow-sm" title="You are a member">
                      <Star className="w-4 h-4" />
                   </div>
                )}
                
                <h3 className="font-title text-xl font-bold text-on-surface pr-10">{club.name}</h3>
                
                <div className="flex flex-wrap gap-2 mt-3">
                   {club.tags.map(tag => (
                      <span key={tag} className="px-2.5 py-1 bg-surface-container-low border border-outline-variant/30 rounded-md text-xs font-label text-on-surface-variant">
                         {tag}
                      </span>
                   ))}
                </div>
                
                <p className="font-body text-sm text-on-surface-variant mt-4 line-clamp-2 min-h-[40px]">
                   {club.description}
                </p>

                <div className="flex flex-col gap-2 mt-6 p-4 bg-surface-container-low rounded-xl border border-outline-variant/20">
                   <p className="font-caption text-xs text-on-surface-variant font-medium flex items-center gap-2">
                     <Calendar className="w-3.5 h-3.5" />
                     {club.schedule}
                   </p>
                   <p className="font-caption text-xs text-on-surface-variant font-medium flex items-center gap-2">
                     <Users className="w-3.5 h-3.5" />
                     {club.room}
                   </p>
                </div>
                
                <div className="mt-6 flex-1 flex items-end">
                   {club.status === "joined" ? (
                      <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-surface-variant/40 text-on-surface font-label text-sm rounded-xl font-bold">
                         View Details <ChevronRight className="w-4 h-4" />
                      </button>
                   ) : (
                      <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-container text-on-primary-container font-label text-sm rounded-xl font-bold hover:bg-primary hover:text-on-primary transition-colors">
                         <PlusCircle className="w-4 h-4" /> Join Club
                      </button>
                   )}
                </div>
             </div>
          ))}
       </div>
    </div>
  );
}
