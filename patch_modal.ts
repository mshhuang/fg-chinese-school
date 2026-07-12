import fs from 'fs';
const content = fs.readFileSync('src/pages/PrincipalClasses.tsx', 'utf-8');
const modalCode = `
       {schoolScheduleModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
           <div className="bg-surface-container-lowest rounded-3xl w-full max-w-4xl p-6 md:p-8 shadow-xl relative max-h-[90vh] overflow-y-auto">
             <button 
               onClick={() => setSchoolScheduleModalOpen(false)}
               className="absolute top-4 right-4 p-2 text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors"
             >
               <X className="w-6 h-6" />
             </button>
             <h2 className="text-2xl font-display font-bold text-on-surface mb-6">School-wide Schedule</h2>
             
             {schoolScheduleUrl ? (
               <div className="flex flex-col gap-6">
                 <div className="rounded-xl overflow-hidden border border-outline-variant/30 flex items-center justify-center bg-surface-variant/30 relative">
                    <img src={schoolScheduleUrl} alt="School Schedule" className="w-full h-auto object-contain" referrerPolicy="no-referrer" />
                 </div>
                 <div className="flex justify-center">
                    <label className="cursor-pointer px-6 py-2 rounded-full font-label font-bold text-sm bg-primary-container text-on-primary-container hover:bg-primary-container/80 transition-colors flex items-center gap-2">
                       <Upload className="w-4 h-4" />
                       {uploadingSchoolSchedule ? "Uploading..." : "Update Schedule"}
                       <input type="file" accept="image/*" className="hidden" onChange={handleSchoolScheduleUpload} disabled={uploadingSchoolSchedule} />
                    </label>
                 </div>
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center py-12 gap-4">
                 <CalendarIcon className="w-16 h-16 text-on-surface-variant opacity-50" />
                 <p className="text-on-surface-variant font-medium text-lg">No school-wide schedule uploaded yet.</p>
                 <label className="cursor-pointer px-6 py-2 rounded-full font-label font-bold text-sm bg-primary text-on-primary hover:bg-primary/90 transition-colors flex items-center gap-2 mt-4">
                    <Upload className="w-4 h-4" />
                    {uploadingSchoolSchedule ? "Uploading..." : "Upload Schedule"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleSchoolScheduleUpload} disabled={uploadingSchoolSchedule} />
                 </label>
               </div>
             )}
           </div>
         </div>
       )}
`;
const replaced = content.replace('{enlargedImage && (', modalCode + '\\n       {enlargedImage && (');
fs.writeFileSync('src/pages/PrincipalClasses.tsx', replaced);
