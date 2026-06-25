const fs = require('fs');
let code = fs.readFileSync('src/pages/StudentPortal.tsx', 'utf8');

// School announcements
const oldAnn = `        {/* School Announcements */}
        <div className="lg:col-span-12 bg-primary-container/10 rounded-3xl border border-primary-container/30 p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6">
           <div className="w-12 h-12 md:w-16 md:h-16 bg-surface-container-lowest rounded-full flex items-center justify-center shrink-0 border-2 border-primary-container z-10 shadow-sm">
              <Megaphone className="w-5 h-5 md:w-8 md:h-8 text-primary opacity-80" />
           </div>
           
           <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                 <h3 className="font-label text-base text-on-surface font-bold">School Announcements</h3>
                 <span className="font-caption text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-sm uppercase tracking-wide font-bold">New</span>
              </div>
              <p className="font-body text-on-surface-variant text-sm">Spring Festival Gala Rehearsals begin next week. All students in the singing program must attend exactly on time.</p>
           </div>
           
           <Link to="/student/announcements" className="font-label text-sm text-primary font-bold hover:underline shrink-0">
              Read More
           </Link>
        </div>`;

const newAnn = `        {/* School Announcements */}
        {announcement && (
        <div className="lg:col-span-12 bg-primary-container/10 rounded-3xl border border-primary-container/30 p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6">
           <div className="w-12 h-12 md:w-16 md:h-16 bg-surface-container-lowest rounded-full flex items-center justify-center shrink-0 border-2 border-primary-container z-10 shadow-sm">
              <Megaphone className="w-5 h-5 md:w-8 md:h-8 text-primary opacity-80" />
           </div>
           
           <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                 <h3 className="font-label text-base text-on-surface font-bold">School Announcements</h3>
                 <span className="font-caption text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-sm uppercase tracking-wide font-bold">New</span>
              </div>
              <p className="font-body text-on-surface-variant text-sm">{announcement.title}</p>
           </div>
           
           <Link to="/student/announcements" className="font-label text-sm text-primary font-bold hover:underline shrink-0">
              Read More
           </Link>
        </div>
        )}`;

code = code.replace(oldAnn, newAnn);

// Assignments
const oldAssignments = `<div className="flex justify-between items-center mb-8">
              <h2 className="font-title text-xl text-on-surface flex items-center gap-3 font-bold">
                <BookOpen className="text-tertiary w-6 h-6" />
                Today's Path
              </h2>
              <span className="font-caption bg-tertiary-container/30 text-tertiary font-bold px-4 py-1.5 rounded-full border border-tertiary-container/50">2 Tasks Left</span>
            </div>
            
            <div className="space-y-4">
              {/* Task 1 */}
              <div className="flex items-center gap-4 p-5 rounded-2xl bg-surface-container-low border border-outline-variant/50 hover:bg-surface transition-all group cursor-pointer shadow-sm hover:shadow">
                 <button className="w-8 h-8 rounded-full border-2 border-outline flex items-center justify-center group-hover:border-primary transition-colors shrink-0"></button>
                 <div className="flex-1 min-w-0">
                    <h3 className="font-body text-lg font-bold text-on-surface truncate">Complete Character Practice worksheet</h3>
                    <p className="font-caption text-sm text-on-surface-variant mt-1.5">Mandarin Arts • Due 3:00 PM</p>
                 </div>
                 <ChevronRight className="text-outline-variant group-hover:text-primary transition-colors w-6 h-6 shrink-0" />
              </div>

              {/* Task 2 Complete */}
              <div className="flex items-center gap-4 p-5 rounded-2xl bg-surface-container-lowest opacity-60 border border-outline-variant/20 shadow-none">
                 <div className="w-8 h-8 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center shrink-0">
                    <Check className="w-5 h-5" />
                 </div>
                 <div className="flex-1 min-w-0">
                    <h3 className="font-body text-lg text-on-surface line-through truncate">Review Chapter 4 History Notes</h3>
                    <p className="font-caption text-sm text-on-surface-variant mt-1.5">Dynasty Studies • Completed</p>
                 </div>
              </div>
            </div>`;

const newAssignments = `<div className="flex justify-between items-center mb-8">
              <h2 className="font-title text-xl text-on-surface flex items-center gap-3 font-bold">
                <BookOpen className="text-tertiary w-6 h-6" />
                Today's Path
              </h2>
              <span className="font-caption bg-tertiary-container/30 text-tertiary font-bold px-4 py-1.5 rounded-full border border-tertiary-container/50">{assignments.length} Tasks Left</span>
            </div>
            
            <div className="space-y-4">
              {assignments.length > 0 ? assignments.map((a: any) => (
                 <Link to="/student/assignments" key={a.assignment_student_id} className="flex items-center gap-4 p-5 rounded-2xl bg-surface-container-low border border-outline-variant/50 hover:bg-surface transition-all group cursor-pointer shadow-sm hover:shadow">
                    <button className="w-8 h-8 rounded-full border-2 border-outline flex items-center justify-center group-hover:border-primary transition-colors shrink-0"></button>
                    <div className="flex-1 min-w-0">
                       <h3 className="font-body text-lg font-bold text-on-surface truncate">{a.assignments?.title}</h3>
                       <p className="font-caption text-sm text-on-surface-variant mt-1.5">{a.assignments?.classes?.class_name} • {a.assignments?.due_date ? \`Due \${new Date(a.assignments.due_date).toLocaleDateString()}\` : 'No due date'}</p>
                    </div>
                    <ChevronRight className="text-outline-variant group-hover:text-primary transition-colors w-6 h-6 shrink-0" />
                 </Link>
              )) : (
                 <div className="p-5 text-center text-on-surface-variant font-body border border-dashed border-outline-variant/50 rounded-2xl">
                    <p>All caught up!</p>
                 </div>
              )}
            </div>`;

code = code.replace(oldAssignments, newAssignments);


// My Programs
const oldPrograms = `<div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-primary-container/10 border border-primary-container/20">
                   <h4 className="font-label font-bold text-primary">Chinese School</h4>
                   <p className="font-caption text-xs text-on-surface-variant">In-person • Grade 4</p>
                </div>
                <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-secondary-container/10 border border-secondary-container/20">
                   <h4 className="font-label font-bold text-secondary">Singing Class</h4>
                   <p className="font-caption text-xs text-on-surface-variant">Weekend • Intermediate</p>
                </div>
                <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-tertiary-container/10 border border-tertiary-container/20">
                   <h4 className="font-label font-bold text-tertiary">Summer Camp</h4>
                   <p className="font-caption text-xs text-on-surface-variant">Enrolled for upcoming season</p>
                </div>
             </div>`;

const newPrograms = `<div className="flex flex-col gap-3">
                {classes.length > 0 ? classes.map((c: any, idx: number) => {
                   const colors = ['primary', 'secondary', 'tertiary'];
                   const color = colors[idx % colors.length];
                   return (
                     <div key={c.class_id} className={\`flex flex-col gap-1.5 p-4 rounded-xl bg-\${color}-container/10 border border-\${color}-container/20\`}>
                        <h4 className={\`font-label font-bold text-\${color}\`}>{c.class_name}</h4>
                     </div>
                   );
                }) : (
                   <p className="text-on-surface-variant text-sm font-body">Not enrolled in any classes.</p>
                )}
             </div>`;

code = code.replace(oldPrograms, newPrograms);

// Achievements (gray out)
code = code.replace(
  '<Badge icon={Star} label="Week Scholar" color="tertiary" active />',
  '<Badge icon={Star} label="Week Scholar" color="tertiary" />'
);
code = code.replace(
  '<Badge icon={Edit3} label="Calligraphy Pro" color="secondary" active />',
  '<Badge icon={Edit3} label="Calligraphy Pro" color="secondary" />'
);


// Class Moments (hide)
const classMomentsBlock = `{/* Class Moments */}
           <section className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-8 shadow-sm">
              <h2 className="font-title text-xl font-bold text-on-surface mb-6">Class Moments</h2>
              <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 snap-x">
                 <div className="w-40 h-32 rounded-2xl overflow-hidden shrink-0 snap-start border border-outline-variant/20 shadow-sm relative group cursor-pointer">
                    <img src="https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=300&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Class" />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                 </div>
                 <div className="w-40 h-32 rounded-2xl overflow-hidden shrink-0 snap-start border border-outline-variant/20 shadow-sm relative group cursor-pointer">
                    <img src="https://images.unsplash.com/photo-1544254272-97b762ac9f78?q=80&w=300&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Writing" />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                 </div>
                 <div className="w-32 h-32 rounded-2xl bg-surface-container flex items-center justify-center shrink-0 snap-start border border-outline-variant/30 hover:bg-surface-container-high transition-colors cursor-pointer">
                    <span className="font-label text-sm text-primary font-bold">+5 More</span>
                 </div>
              </div>
           </section>`;

code = code.replace(classMomentsBlock, "");


fs.writeFileSync('src/pages/StudentPortal.tsx', code);
