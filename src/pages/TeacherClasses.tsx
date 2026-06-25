import { useState, useEffect } from "react";
import { Search, Filter, Users, BookOpen, Clock, X, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function TeacherClasses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [classesData, setClassesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
       setLoading(true);
       const userStr = localStorage.getItem('user');
       if (!userStr) {
         setLoading(false);
         return;
       }
       const u = JSON.parse(userStr);
       if (!u || !u.id || u.id === 'demo') {
         setLoading(false);
         return;
       }

       // Fetch classes where this user is the primary teacher, and also fetch enrollment count
       const { data: clsData } = await supabase.from('classes').select('*, enrollments(count)').eq('primary_teacher_id', u.id);
       
       if (clsData) {
         setClassesData(clsData);
       }
       
       setLoading(false);
    }
    fetchData();
  }, []);

  const filteredClasses = classesData.filter(c => 
    c.class_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-[1600px] mx-auto p-6 md:p-8 flex flex-col gap-8 pb-32 md:pb-8">
       {/* Header */}
       <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div>
           <h1 className="font-display text-4xl text-primary font-bold tracking-tight">My Classes</h1>
           <p className="font-body text-lg text-on-surface-variant mt-2">Manage your classes and students.</p>
         </div>
       </header>

       {/* Toolbar */}
       <div className="flex flex-col xl:flex-row justify-between gap-6">
          <div className="flex items-center gap-3 bg-surface-container-low rounded-full px-4 py-2 border border-outline-variant/40 shrink-0 w-full xl:w-80 shadow-sm focus-within:border-primary/50 transition-colors">
             <Search className="w-5 h-5 text-on-surface-variant" />
             <input 
               type="text" 
               placeholder="Search classes..." 
               className="bg-transparent border-none outline-none font-body text-sm w-full"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
             <button className="p-1.5 text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors">
               <Filter className="w-4 h-4" />
             </button>
          </div>
       </div>

       {/* List / Grid */}
       {loading ? (
          <div className="flex items-center justify-center p-12">
             <div className="w-8 h-8 animate-spin text-primary border-4 border-primary border-t-transparent rounded-full" />
          </div>
       ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-6 gap-4">
             {filteredClasses.map(cls => (
                <div key={cls.class_id} className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-6 flex flex-col hover:shadow-md transition-all shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                       <h3 className="font-display text-2xl font-bold text-on-surface">{cls.class_name}</h3>
                       <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-label bg-primary-container/20 text-primary border border-primary/20">
                          Active
                       </span>
                    </div>

                    <div className="flex flex-col gap-3 mb-6">
                       <div className="flex items-center gap-3 text-on-surface-variant">
                         <Clock className="w-4 h-4 shrink-0" />
                         <span className="font-body text-sm">Schedule TBD</span>
                       </div>
                       <div className="flex items-center gap-3 text-on-surface-variant">
                         <BuildingIcon className="w-4 h-4 shrink-0" />
                         <span className="font-body text-sm">Room TBD</span>
                       </div>
                    </div>

                    {cls.schedule_image_url && (
                      <div className="mb-6 rounded-xl overflow-hidden border border-outline-variant/30 flex items-center justify-center bg-surface-variant/30 relative cursor-pointer" style={{ minHeight: '120px' }} onClick={() => setEnlargedImage(cls.schedule_image_url)}>
                         <img src={cls.schedule_image_url} alt="Schedule" className="object-contain w-full h-auto hover:scale-[1.02] transition-transform duration-300" referrerPolicy="no-referrer" />
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20 mt-auto">
                       <div className="flex items-center gap-2 text-on-surface-variant">
                          <Users className="w-4 h-4 shrink-0" />
                          <span className="font-label text-sm font-bold">{cls.enrollments?.[0]?.count || 0} Students Enrolled</span>
                       </div>
                       <button onClick={() => navigate('/teacher/assignments')} className="text-primary font-label text-sm font-bold flex items-center gap-1 hover:underline">
                         Assign Homework <ArrowRight className="w-4 h-4" />
                       </button>
                    </div>
                </div>
             ))}

             {filteredClasses.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center p-12 bg-surface-container-low border border-dashed border-outline-variant/40 rounded-3xl">
                   <BookOpen className="w-12 h-12 text-on-surface-variant opacity-50 mb-4" />
                   <p className="font-body text-lg text-on-surface font-medium">No classes found</p>
                </div>
             )}
          </div>
       )}

       {enlargedImage && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setEnlargedImage(null)}>
             <img src={enlargedImage} className="max-w-full max-h-full object-contain rounded-lg" alt="Enlarged schedule" />
             <button className="absolute top-6 right-6 text-white bg-black/50 p-2 rounded-full hover:bg-black/80 transition-colors cursor-pointer" onClick={() => setEnlargedImage(null)}>
               <X className="w-6 h-6" />
             </button>
         </div>
       )}
    </div>
  );
}

function BuildingIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  );
}
