import fs from 'fs';
const content = fs.readFileSync('src/pages/PrincipalClasses.tsx', 'utf-8');
const corrected = content.replace(
  /<button onClick=\{\(\) => setShowAddClass\(true\)\} className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-label font-bold hover:bg-primary\/90 transition-colors shadow-md w-full md:w-auto justify-center">\n         <button onClick=\{\(\) => setSchoolScheduleModalOpen\(true\)\} className="flex items-center gap-2 bg-secondary text-on-secondary px-6 py-3 rounded-full font-label font-bold hover:bg-secondary\/90 transition-colors shadow-md w-full md:w-auto justify-center"><CalendarIcon className="w-5 h-5" \/> School Schedule<\/button>\n            <Plus className="w-5 h-5" \/> Add New Class\n         <\/button>/g,
  `<div className="flex gap-4 w-full md:w-auto">
         <button onClick={() => setSchoolScheduleModalOpen(true)} className="flex items-center gap-2 bg-secondary text-on-secondary px-6 py-3 rounded-full font-label font-bold hover:bg-secondary/90 transition-colors shadow-md flex-1 md:flex-none justify-center">
            <CalendarIcon className="w-5 h-5" /> School Schedule
         </button>
         <button onClick={() => setShowAddClass(true)} className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-label font-bold hover:bg-primary/90 transition-colors shadow-md flex-1 md:flex-none justify-center">
            <Plus className="w-5 h-5" /> Add New Class
         </button>
         </div>`
);
fs.writeFileSync('src/pages/PrincipalClasses.tsx', corrected);
