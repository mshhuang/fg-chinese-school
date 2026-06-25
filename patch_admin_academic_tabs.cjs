const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminAcademic.tsx', 'utf8');

const oldTabs = `<div className="flex gap-4 border-b border-outline-variant/30 overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setActiveTab('programs')}
            className={\`pb-4 px-2 font-label font-bold text-sm whitespace-nowrap transition-all border-b-2 \${activeTab === 'programs' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'}\`}
          >
            Programs
          </button>
          <button 
            onClick={() => setActiveTab('classes')}
            className={\`pb-4 px-2 font-label font-bold text-sm whitespace-nowrap transition-all border-b-2 \${activeTab === 'classes' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'}\`}
          >
            Classes
          </button>
          <button 
            onClick={() => setActiveTab('enrollments')}
            className={\`pb-4 px-2 font-label font-bold text-sm whitespace-nowrap transition-all border-b-2 \${activeTab === 'enrollments' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'}\`}
          >
            Enrollments
          </button>
          <div className="w-px h-6 bg-outline-variant/50 self-center mx-2" />
          <button 
            onClick={() => setActiveTab('subjects')}
            className={\`pb-4 px-2 font-label font-bold text-sm whitespace-nowrap transition-all border-b-2 \${activeTab === 'subjects' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'}\`}
          >
            Subjects
          </button>
          <button 
            onClick={() => setActiveTab('periods')}
            className={\`pb-4 px-2 font-label font-bold text-sm whitespace-nowrap transition-all border-b-2 \${activeTab === 'periods' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'}\`}
          >
            Periods
          </button>
          <button 
            onClick={() => setActiveTab('rooms')}
            className={\`pb-4 px-2 font-label font-bold text-sm whitespace-nowrap transition-all border-b-2 \${activeTab === 'rooms' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'}\`}
          >
            Rooms & Facilities
          </button>
      </div>`;

const newTabs = `<div className="sticky top-6 z-20 flex p-1.5 bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl w-full md:w-fit border border-outline-variant/30 shadow-sm overflow-x-auto hide-scrollbar shrink-0">
          <button 
            onClick={() => setActiveTab('programs')}
            className={\`px-6 py-2.5 rounded-xl font-label font-bold text-sm transition-all whitespace-nowrap \${activeTab === 'programs' ? 'bg-surface shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'}\`}
          >
            Programs
          </button>
          <button 
            onClick={() => setActiveTab('classes')}
            className={\`px-6 py-2.5 rounded-xl font-label font-bold text-sm transition-all whitespace-nowrap \${activeTab === 'classes' ? 'bg-surface shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'}\`}
          >
            Classes
          </button>
          <button 
            onClick={() => setActiveTab('enrollments')}
            className={\`px-6 py-2.5 rounded-xl font-label font-bold text-sm transition-all whitespace-nowrap \${activeTab === 'enrollments' ? 'bg-surface shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'}\`}
          >
            Enrollments
          </button>
          <div className="w-px h-6 bg-outline-variant/50 self-center mx-2" />
          <button 
            onClick={() => setActiveTab('subjects')}
            className={\`px-6 py-2.5 rounded-xl font-label font-bold text-sm transition-all whitespace-nowrap \${activeTab === 'subjects' ? 'bg-surface shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'}\`}
          >
            Subjects
          </button>
          <button 
            onClick={() => setActiveTab('periods')}
            className={\`px-6 py-2.5 rounded-xl font-label font-bold text-sm transition-all whitespace-nowrap \${activeTab === 'periods' ? 'bg-surface shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'}\`}
          >
            Periods
          </button>
          <button 
            onClick={() => setActiveTab('rooms')}
            className={\`px-6 py-2.5 rounded-xl font-label font-bold text-sm transition-all whitespace-nowrap \${activeTab === 'rooms' ? 'bg-surface shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'}\`}
          >
            Rooms & Facilities
          </button>
      </div>`;

code = code.replace(oldTabs, newTabs);
fs.writeFileSync('src/pages/AdminAcademic.tsx', code);
